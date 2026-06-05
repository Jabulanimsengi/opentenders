import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DocumentsService, UploadedDocument } from './documents.service';

const analysisPayload = {
  summary:
    'This tender requires proof of experience and a valid tax clearance.',
  keyRequirements: ['Submit before closing date'],
  eligibility: ['Registered supplier'],
  deadlines: ['Closing date: 30 June 2026'],
  requiredDocuments: ['Tax clearance certificate'],
  risks: ['Late submissions may be rejected'],
  nextSteps: ['Prepare compliance documents'],
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  let configService: { get: jest.Mock };
  let fetchMock: jest.Mock;
  let axiosGetMock: jest.SpyInstance;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-openai-key';
        if (key === 'OPENAI_CHAT_MODEL') return 'gpt-5-mini';
        return undefined;
      }),
    };
    service = new DocumentsService(configService as unknown as ConfigService);
    axiosGetMock = jest.spyOn(axios, 'get').mockResolvedValue({
      data: Buffer.from('downloaded pdf bytes'),
      headers: {
        'content-type': 'application/pdf',
      },
    } as any);
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        output_text: JSON.stringify(analysisPayload),
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends uploaded documents to the OpenAI Responses API', async () => {
    const file: UploadedDocument = {
      originalname: 'tender.pdf',
      mimetype: 'application/pdf',
      size: 1234,
      buffer: Buffer.from('fake pdf bytes'),
    };

    const result = await service.analyzeUploadedDocument(file, {
      tenderTitle: 'Road maintenance tender',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.openai.com/v1/responses',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-openai-key',
        }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe('gpt-5-mini');
    expect(body.input[0].content[1]).toEqual(
      expect.objectContaining({
        type: 'input_file',
        filename: 'tender.pdf',
        file_data: Buffer.from('fake pdf bytes').toString('base64'),
      }),
    );
    expect(result.analysis).toEqual(analysisPayload);
  });

  it('rejects unsupported uploads before calling OpenAI', async () => {
    const file: UploadedDocument = {
      originalname: 'image.exe',
      mimetype: 'application/octet-stream',
      size: 100,
      buffer: Buffer.from('binary'),
    };

    await expect(
      service.analyzeUploadedDocument(file, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts spreadsheet tender schedules for analysis', async () => {
    const file: UploadedDocument = {
      originalname: 'pricing-schedule.xlsx',
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1234,
      buffer: Buffer.from('fake spreadsheet bytes'),
    };

    const result = await service.analyzeUploadedDocument(file, {
      tenderTitle: 'Supply tender',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.input[0].content[1]).toEqual(
      expect.objectContaining({
        type: 'input_file',
        filename: 'pricing-schedule.xlsx',
        file_data: Buffer.from('fake spreadsheet bytes').toString('base64'),
      }),
    );
    expect(result.analysis).toEqual(analysisPayload);
  });

  it('downloads linked documents and sends file bytes to OpenAI', async () => {
    const downloadedBytes = Buffer.from('downloaded pdf bytes');
    axiosGetMock.mockResolvedValueOnce({
      data: downloadedBytes,
      headers: {
        'content-type': 'application/pdf',
      },
    } as any);

    const result = await service.analyzeDocumentUrl({
      documentUrl: 'https://example.com/tender.pdf',
      fileName: 'tender.pdf',
      tenderTitle: 'Road maintenance tender',
    });

    expect(axiosGetMock).toHaveBeenCalledWith(
      'https://example.com/tender.pdf',
      expect.objectContaining({
        responseType: 'arraybuffer',
        headers: expect.objectContaining({
          Accept: expect.stringContaining('application/pdf'),
          'Accept-Language': expect.stringContaining('en-ZA'),
          Referer: 'https://example.com/',
          'User-Agent': expect.stringContaining('Chrome'),
        }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.input[0].content[1]).toEqual({
      type: 'input_file',
      filename: 'tender.pdf',
      file_data: downloadedBytes.toString('base64'),
    });
    expect(body.input[0].content[1]).not.toHaveProperty('file_url');
    expect(result.fileName).toBe('tender.pdf');
    expect(result.fileType).toBe('application/pdf');
    expect(result.fileSize).toBe(downloadedBytes.length);
    expect(result.analysis).toEqual(analysisPayload);
  });

  it('falls back to remote URL analysis when the linked document cannot be downloaded', async () => {
    axiosGetMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
      message: 'Not found',
    });

    const result = await service.analyzeDocumentUrl({
      documentUrl: 'https://example.com/missing.pdf',
      fileName: 'missing.pdf',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.input[0].content[1]).toEqual({
      type: 'input_file',
      filename: 'missing.pdf',
      file_url: 'https://example.com/missing.pdf',
    });
    expect(result.analysisSource).toBe('remote_url');
    expect(result.downloadWarning).toContain(
      'Could not download tender document for analysis',
    );
    expect(result.analysis).toEqual(analysisPayload);
  });

  it('returns a bad request when download and remote URL fallback both fail', async () => {
    axiosGetMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 403 },
      message: 'Forbidden',
    });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({
        error: { message: 'OpenAI could not fetch the file URL.' },
      }),
    });

    await expect(
      service.analyzeDocumentUrl({
        documentUrl: 'https://example.com/blocked.pdf',
        fileName: 'blocked.pdf',
      }),
    ).rejects.toThrow('OpenAI could not access the document URL');
  });

  it('tells the model to ignore repeated boilerplate and return a scannable summary', async () => {
    const file: UploadedDocument = {
      originalname: 'tender.pdf',
      mimetype: 'application/pdf',
      size: 1234,
      buffer: Buffer.from('fake pdf bytes'),
    };

    await service.analyzeUploadedDocument(file, {
      tenderTitle: 'Road maintenance tender',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    const prompt = body.input[0].content[0].text;

    expect(prompt).toContain(
      'Write the summary as 2-4 short, scannable sentences or paragraphs',
    );
    expect(prompt).toContain('Ignore generic boilerplate');
    expect(prompt).toContain('portal headers');
    expect(prompt).toContain('unless it changes a bid requirement');
  });

  it('returns a service error when the OpenAI key is missing', async () => {
    configService.get = jest.fn((key: string) => {
      if (key === 'OPENAI_CHAT_MODEL') return 'gpt-5-mini';
      return undefined;
    });
    service = new DocumentsService(configService as unknown as ConfigService);

    await expect(
      service.analyzeDocumentUrl({
        documentUrl: 'https://example.com/tender.pdf',
        fileName: 'tender.pdf',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('gracefully repairs truncated JSON responses from OpenAI', async () => {
    const incompleteJson = `{ "summary": "City of Cape Town tender...", "keyRequirements": [ "Submit Form of Offer" ], "eligibility": [ "Registered supplier", "Tenderer`;

    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        output_text: incompleteJson,
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const file: UploadedDocument = {
      originalname: 'tender.pdf',
      mimetype: 'application/pdf',
      size: 1234,
      buffer: Buffer.from('fake pdf bytes'),
    };

    const result = await service.analyzeUploadedDocument(file, {});

    expect(result.analysis.summary).toBe('City of Cape Town tender...');
    expect(result.analysis.keyRequirements).toEqual(['Submit Form of Offer']);
    expect(result.analysis.eligibility).toEqual([
      'Registered supplier',
      'Tenderer',
    ]);
  });
});
