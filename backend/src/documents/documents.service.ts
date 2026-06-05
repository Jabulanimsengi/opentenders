import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as https from 'https';

export type UploadedDocument = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

type AnalyzeContext = {
  instructions?: string;
  tenderTitle?: string;
  tenderDescription?: string;
  documentTitle?: string;
};

type AnalyzeUrlContext = AnalyzeContext & {
  documentUrl?: string;
  fileName?: string;
};

type DownloadedDocument = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
};

const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
  'application/typescript',
  'application/x-sh',
  'text/css',
  'text/csv',
  'text/html',
  'text/javascript',
  'text/markdown',
  'text/plain',
  'text/x-c',
  'text/x-c++',
  'text/x-csharp',
  'text/x-golang',
  'text/x-java',
  'text/x-php',
  'text/x-python',
  'text/x-ruby',
  'text/x-script.python',
  'text/x-tex',
]);

const SUPPORTED_EXTENSIONS = new Set([
  '.c',
  '.cpp',
  '.cs',
  '.css',
  '.csv',
  '.doc',
  '.docx',
  '.go',
  '.html',
  '.xls',
  '.xlsx',
  '.java',
  '.js',
  '.json',
  '.md',
  '.pdf',
  '.php',
  '.pptx',
  '.py',
  '.rb',
  '.sh',
  '.tex',
  '.ts',
  '.txt',
]);

const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 60000;

const MIME_EXTENSION_MAP: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    '.pptx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/csv': '.csv',
  'text/html': '.html',
  'text/markdown': '.md',
  'text/plain': '.txt',
};

const ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'keyRequirements',
    'eligibility',
    'deadlines',
    'requiredDocuments',
    'risks',
    'nextSteps',
  ],
  properties: {
    summary: { type: 'string' },
    keyRequirements: { type: 'array', items: { type: 'string' } },
    eligibility: { type: 'array', items: { type: 'string' } },
    deadlines: { type: 'array', items: { type: 'string' } },
    requiredDocuments: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    nextSteps: { type: 'array', items: { type: 'string' } },
  },
};

@Injectable()
export class DocumentsService {
  private readonly httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  constructor(private readonly configService: ConfigService) {}

  async analyzeUploadedDocument(
    file: UploadedDocument,
    context: AnalyzeContext,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Please upload a document to analyse.');
    }

    this.validateFile(file.originalname, file.mimetype, file.size);

    const analysis = await this.requestAnalysis(
      [
        { type: 'input_text', text: this.buildPrompt(context) },
        {
          type: 'input_file',
          filename: file.originalname,
          file_data: file.buffer.toString('base64'),
        },
      ],
      context,
    );

    return {
      source: 'upload',
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      ...analysis,
    };
  }

  async analyzeDocumentUrl(context: AnalyzeUrlContext) {
    const documentUrl = context.documentUrl?.trim();
    if (!documentUrl) {
      throw new BadRequestException('Document URL is required.');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(documentUrl);
    } catch {
      throw new BadRequestException('Document URL is invalid.');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new BadRequestException(
        'Only HTTP and HTTPS document URLs are supported.',
      );
    }

    let downloaded: DownloadedDocument | null = null;
    let downloadWarning: string | null = null;

    try {
      downloaded = await this.downloadDocument(documentUrl, parsedUrl, context);
    } catch (error) {
      downloadWarning = this.getExceptionMessage(error);
    }

    const fileName =
      downloaded?.fileName ||
      this.resolveDownloadedFileName(
        context,
        parsedUrl,
        this.inferMimeTypeFromPath(parsedUrl),
      );

    let analysis: Awaited<ReturnType<typeof this.requestAnalysis>>;
    try {
      analysis = await this.requestAnalysis(
        [
          { type: 'input_text', text: this.buildPrompt(context) },
          downloaded
            ? {
                type: 'input_file',
                filename: downloaded.fileName,
                file_data: downloaded.buffer.toString('base64'),
              }
            : {
                type: 'input_file',
                filename: fileName,
                file_url: documentUrl,
              },
        ],
        context,
      );
    } catch (error) {
      if (downloaded || !downloadWarning) throw error;
      throw new BadRequestException(
        `${downloadWarning} OpenAI could not access the document URL as a fallback either: ${this.getExceptionMessage(error)}`,
      );
    }

    return {
      source: 'url',
      documentUrl,
      fileName,
      fileType: downloaded?.mimeType || null,
      fileSize: downloaded?.size || null,
      analysisSource: downloaded ? 'downloaded_file' : 'remote_url',
      downloadWarning,
      ...analysis,
    };
  }

  private async downloadDocument(
    documentUrl: string,
    parsedUrl: URL,
    context: AnalyzeUrlContext,
  ): Promise<DownloadedDocument> {
    try {
      const response = await axios.get<ArrayBuffer>(documentUrl, {
        responseType: 'arraybuffer',
        timeout: DOWNLOAD_TIMEOUT_MS,
        maxContentLength: MAX_DOCUMENT_BYTES,
        maxBodyLength: MAX_DOCUMENT_BYTES,
        httpsAgent: this.httpsAgent,
        headers: {
          Accept:
            'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,text/plain,text/html,*/*',
          'Accept-Language': 'en-ZA,en;q=0.9',
          'Cache-Control': 'no-cache',
          Referer: `${parsedUrl.origin}/`,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        },
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const buffer = Buffer.from(response.data);
      const mimeType = this.normalizeMimeType(response.headers['content-type']);
      const fileName = this.resolveDownloadedFileName(
        context,
        parsedUrl,
        mimeType,
        response.headers['content-disposition'],
      );

      this.validateFile(fileName, mimeType, buffer.length);

      return {
        buffer,
        fileName,
        mimeType,
        size: buffer.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const message = axios.isAxiosError(error)
        ? this.describeDownloadError(error)
        : error instanceof Error
          ? error.message
          : String(error);
      throw new BadRequestException(
        `Could not download tender document for analysis. ${message}`,
      );
    }
  }

  private validateFile(fileName: string, mimeType: string, size: number) {
    if (size <= 0) {
      throw new BadRequestException('Downloaded document is empty.');
    }

    if (size > MAX_DOCUMENT_BYTES) {
      throw new BadRequestException('Document must be 25 MB or smaller.');
    }

    const extension = this.getExtension(fileName);
    const supportedMime = mimeType ? SUPPORTED_MIME_TYPES.has(mimeType) : false;
    const supportedExtension = extension
      ? SUPPORTED_EXTENSIONS.has(extension)
      : false;

    if (!supportedMime && !supportedExtension) {
      throw new BadRequestException(
        'Unsupported document type. Upload a PDF, Word document, spreadsheet, presentation, or text-based file.',
      );
    }
  }

  private async requestAnalysis(content: unknown[], context: AnalyzeContext) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OpenAI API key is not configured.',
      );
    }

    const model =
      this.configService.get<string>('OPENAI_CHAT_MODEL') || 'gpt-5-mini';

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'user',
            content,
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'tender_document_analysis',
            strict: true,
            schema: ANALYSIS_SCHEMA,
          },
        },
        max_output_tokens: 4000,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload?.error?.message || 'OpenAI document analysis failed.';
      throw new InternalServerErrorException(message);
    }

    const outputText = this.extractOutputText(payload);
    if (!outputText) {
      throw new InternalServerErrorException(
        'OpenAI returned an empty analysis.',
      );
    }

    return {
      model,
      tenderTitle: context.tenderTitle || null,
      analysis: this.parseAnalysis(outputText),
    };
  }

  private buildPrompt(context: AnalyzeContext) {
    const extraInstructions = context.instructions?.trim();

    return [
      'Analyse this tender/procurement document and return JSON only.',
      'Focus on practical bid preparation details for a South African business user.',
      'Write the summary as 2-4 short, scannable sentences or paragraphs. Keep one idea per sentence.',
      'Do not invent missing dates, requirements, documents, or eligibility rules. If a detail is absent, leave the relevant array empty.',
      'Ignore generic boilerplate that appears across many tender documents, including portal headers, standard terms of use, legal disclaimers, privacy notices, copyright text, navigation labels, download instructions, and repeated procurement platform text unless it changes a bid requirement for this tender.',
      context.tenderTitle ? `Tender title: ${context.tenderTitle}` : '',
      context.documentTitle ? `Document title: ${context.documentTitle}` : '',
      context.tenderDescription
        ? `Tender description: ${context.tenderDescription}`
        : '',
      extraInstructions
        ? `Additional user instructions: ${extraInstructions}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private extractOutputText(payload: any): string | null {
    if (typeof payload?.output_text === 'string') {
      return payload.output_text;
    }

    for (const item of payload?.output || []) {
      for (const contentItem of item?.content || []) {
        if (
          contentItem?.type === 'output_text' &&
          typeof contentItem.text === 'string'
        ) {
          return contentItem.text;
        }
      }
    }

    return null;
  }

  private parseAnalysis(outputText: string) {
    const defaultAnalysis = {
      summary: '',
      keyRequirements: [],
      eligibility: [],
      deadlines: [],
      requiredDocuments: [],
      risks: [],
      nextSteps: [],
    };

    try {
      const parsed = JSON.parse(outputText);
      return { ...defaultAnalysis, ...parsed };
    } catch {
      try {
        const repaired = this.repairJson(outputText);
        const parsed = JSON.parse(repaired);
        return { ...defaultAnalysis, ...parsed };
      } catch {
        return {
          ...defaultAnalysis,
          summary: outputText,
        };
      }
    }
  }

  private repairJson(jsonStr: string): string {
    let state: 'DEFAULT' | 'STRING' | 'ESCAPE' = 'DEFAULT';
    const stack: ('{' | '[')[] = [];
    let cleanStr = '';
    let i = 0;

    while (i < jsonStr.length) {
      const char = jsonStr[i];
      if (state === 'DEFAULT') {
        if (char === '"') {
          state = 'STRING';
          cleanStr += char;
        } else if (char === '{') {
          stack.push('{');
          cleanStr += char;
        } else if (char === '[') {
          stack.push('[');
          cleanStr += char;
        } else if (char === '}') {
          if (stack[stack.length - 1] === '{') {
            stack.pop();
          }
          cleanStr += char;
        } else if (char === ']') {
          if (stack[stack.length - 1] === '[') {
            stack.pop();
          }
          cleanStr += char;
        } else {
          cleanStr += char;
        }
      } else if (state === 'STRING') {
        if (char === '\\') {
          state = 'ESCAPE';
          cleanStr += char;
        } else if (char === '"') {
          state = 'DEFAULT';
          cleanStr += char;
        } else {
          cleanStr += char;
        }
      } else if (state === 'ESCAPE') {
        state = 'STRING';
        cleanStr += char;
      }
      i++;
    }

    if (state === 'ESCAPE') {
      cleanStr = cleanStr.slice(0, -1);
      state = 'STRING';
    }

    if (state === 'STRING') {
      cleanStr += '"';
    }

    let temp = cleanStr.trim();
    let modified = true;

    while (modified) {
      modified = false;
      temp = temp.trim();
      if (temp.endsWith(',')) {
        temp = temp.slice(0, -1);
        modified = true;
      } else if (temp.endsWith(':')) {
        temp = temp.slice(0, -1);
        modified = true;

        temp = temp.trim();
        if (temp.endsWith('"')) {
          let j = temp.length - 2;
          let escaped = false;
          while (j >= 0) {
            if (temp[j] === '"' && !escaped) {
              break;
            }
            if (temp[j] === '\\') {
              let bsCount = 0;
              let k = j;
              while (k >= 0 && temp[k] === '\\') {
                bsCount++;
                k--;
              }
              escaped = bsCount % 2 === 1;
            } else {
              escaped = false;
            }
            j--;
          }
          if (j >= 0) {
            temp = temp.slice(0, j);
            modified = true;
          }
        }
      } else if (temp.endsWith('"') && stack[stack.length - 1] === '{') {
        let j = temp.length - 2;
        let escaped = false;
        while (j >= 0) {
          if (temp[j] === '"' && !escaped) {
            break;
          }
          if (temp[j] === '\\') {
            let bsCount = 0;
            let k = j;
            while (k >= 0 && temp[k] === '\\') {
              bsCount++;
              k--;
            }
            escaped = bsCount % 2 === 1;
          } else {
            escaped = false;
          }
          j--;
        }
        if (j >= 0) {
          let k = j - 1;
          while (k >= 0 && /\s/.test(temp[k])) {
            k--;
          }
          if (k >= 0 && (temp[k] === ',' || temp[k] === '{')) {
            temp = temp.slice(0, j);
            modified = true;
          }
        }
      }
    }

    let closedStr = temp;
    for (let j = stack.length - 1; j >= 0; j--) {
      const symbol = stack[j];
      if (symbol === '{') {
        closedStr += '}';
      } else if (symbol === '[') {
        closedStr += ']';
      }
    }

    return closedStr;
  }

  private getExtension(fileName: string) {
    const match = fileName.toLowerCase().match(/\.[a-z0-9]+$/);
    return match?.[0] || '';
  }

  private normalizeMimeType(contentType?: unknown) {
    const raw = Array.isArray(contentType) ? contentType[0] : contentType;
    const value = typeof raw === 'string' ? raw : undefined;
    return (
      value?.split(';')[0]?.trim().toLowerCase() || 'application/octet-stream'
    );
  }

  private inferMimeTypeFromPath(parsedUrl: URL) {
    const extension = this.getExtension(parsedUrl.pathname);
    const match = Object.entries(MIME_EXTENSION_MAP).find(
      ([, mappedExtension]) => mappedExtension === extension,
    );
    return match?.[0] || 'application/octet-stream';
  }

  private resolveDownloadedFileName(
    context: AnalyzeUrlContext,
    parsedUrl: URL,
    mimeType: string,
    contentDisposition?: unknown,
  ) {
    const rawDisposition = Array.isArray(contentDisposition)
      ? contentDisposition[0]
      : contentDisposition;
    const dispositionName = this.fileNameFromContentDisposition(
      typeof rawDisposition === 'string' ? rawDisposition : undefined,
    );
    const urlName = decodeURIComponent(
      parsedUrl.pathname.split('/').filter(Boolean).pop() || '',
    );
    const requestedName = context.fileName || context.documentTitle;
    const baseName = this.sanitizeFileName(
      dispositionName || requestedName || urlName || 'tender-document',
    );

    if (this.getExtension(baseName)) return baseName;

    const extension =
      this.getExtension(urlName) ||
      MIME_EXTENSION_MAP[mimeType] ||
      (mimeType === 'application/octet-stream' ? '.pdf' : '');

    return `${baseName}${extension}`;
  }

  private fileNameFromContentDisposition(value?: string) {
    if (!value) return undefined;
    const utfMatch = value.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);
    const plainMatch = value.match(/filename="?([^";]+)"?/i);
    return plainMatch?.[1];
  }

  private sanitizeFileName(value: string) {
    return (
      value
        .replace(/[\\/:*?"<>|]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 180) || 'tender-document'
    );
  }

  private describeDownloadError(error: import('axios').AxiosError) {
    if (error.response) {
      return `Remote server returned HTTP ${error.response.status}.`;
    }
    if (error.code === 'ECONNABORTED') {
      return 'The document download timed out.';
    }
    if (error.code) {
      return `${error.code}: ${error.message}`;
    }
    return error.message;
  }

  private getExceptionMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unexpected document analysis error.';
  }
}
