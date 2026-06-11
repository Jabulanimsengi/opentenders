/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateTenderSourceDto,
  UpdateTenderSourceDto,
} from './dto/external-source.dto';
import { ExternalSourcesService } from './external-sources.service';

@Controller('external-sources')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ExternalSourcesController {
  constructor(
    private readonly externalSourcesService: ExternalSourcesService,
  ) {}

  @Get()
  findAll() {
    return this.externalSourcesService.findAll();
  }

  @Get('health')
  getHealth() {
    return this.externalSourcesService.getHealth();
  }

  @Get('issues')
  getIssues() {
    return this.externalSourcesService.getIssues();
  }

  @Post()
  create(@Body() dto: CreateTenderSourceDto) {
    return this.externalSourcesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenderSourceDto) {
    return this.externalSourcesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.externalSourcesService.delete(id);
  }

  @Post('scrape-all')
  scrapeAll() {
    return this.externalSourcesService.scrapeAllActive();
  }

  @Post('check-active')
  checkActiveSourceAvailability() {
    return this.externalSourcesService.checkActiveSourceAvailability();
  }

  @Patch('issues/:id')
  updateIssue(
    @Param('id') id: string,
    @Body()
    dto: {
      status?: string;
      severity?: string;
      assignedTo?: string | null;
      resolutionNote?: string | null;
    },
  ) {
    return this.externalSourcesService.updateIssue(id, dto);
  }

  @Post(':id/scrape')
  scrapeSource(@Param('id') id: string) {
    return this.externalSourcesService.scrapeSource(id);
  }

  @Post(':id/check')
  checkSourceAvailability(@Param('id') id: string) {
    return this.externalSourcesService.checkSourceAvailability(id);
  }
}
