import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TendersService } from './tenders.service';
import { TenderQueryDto } from './dto';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('tenders')
@UseGuards(OptionalJwtAuthGuard)
export class TendersController {
  constructor(private tendersService: TendersService) {}

  @Get()
  async findAll(@Query() query: TenderQueryDto, @Request() req: any) {
    return this.tendersService.findAll(query, req.user?.id);
  }

  @Get('stats')
  async getStats() {
    return this.tendersService.getStats();
  }

  @Get('facets')
  async getFacets() {
    return this.tendersService.getFacets();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Request() req: any) {
    const tender = await this.tendersService.findOne(slug, req.user?.id);
    if (!tender) {
      throw new NotFoundException(`Tender not found`);
    }
    return tender;
  }
}
