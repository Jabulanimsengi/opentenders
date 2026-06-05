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

  @Post(':id/scrape')
  scrapeSource(@Param('id') id: string) {
    return this.externalSourcesService.scrapeSource(id);
  }
}
