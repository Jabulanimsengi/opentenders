import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { TendersService } from './tenders.service';
import { TenderQueryDto } from './dto';

@Controller('tenders')
export class TendersController {
    constructor(private tendersService: TendersService) { }

    @Get()
    async findAll(@Query() query: TenderQueryDto) {
        return this.tendersService.findAll(query);
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
    async findOne(@Param('slug') slug: string) {
        const tender = await this.tendersService.findOne(slug);
        if (!tender) {
            throw new NotFoundException(`Tender not found`);
        }
        return tender;
    }
}
