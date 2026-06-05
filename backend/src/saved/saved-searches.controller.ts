import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import {
  CreateSavedSearchDto,
  UpdateSavedSearchDto,
} from './saved-searches.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.savedSearchesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.savedSearchesService.findOne(id, req.user.id);
  }

  @Get(':id/count')
  getMatchCount(@Param('id') id: string, @Request() req: any) {
    return this.savedSearchesService.getMatchCount(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateSavedSearchDto, @Request() req: any) {
    return this.savedSearchesService.create(req.user.id, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSavedSearchDto,
    @Request() req: any,
  ) {
    return this.savedSearchesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.savedSearchesService.delete(id, req.user.id);
  }
}
