import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import type { UploadedDocument } from './documents.service';

type AnalyzeUploadBody = {
  instructions?: string;
  tenderTitle?: string;
  tenderDescription?: string;
};

type AnalyzeUrlBody = AnalyzeUploadBody & {
  documentUrl?: string;
  fileName?: string;
  documentTitle?: string;
};

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }),
  )
  analyzeUpload(
    @UploadedFile() file: UploadedDocument,
    @Body() body: AnalyzeUploadBody,
  ) {
    return this.documentsService.analyzeUploadedDocument(file, body);
  }

  @Post('analyze-url')
  analyzeUrl(@Body() body: AnalyzeUrlBody) {
    return this.documentsService.analyzeDocumentUrl(body);
  }
}
