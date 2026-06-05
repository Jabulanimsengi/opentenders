import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Get()
  async getBookmarks(@Request() req: any) {
    return this.bookmarksService.getBookmarks(req.user.id);
  }

  @Post()
  async addBookmark(@Request() req: any, @Body() body: { tenderId: string }) {
    return this.bookmarksService.addBookmark(req.user.id, body.tenderId);
  }

  @Delete(':tenderId')
  async removeBookmark(
    @Request() req: any,
    @Param('tenderId') tenderId: string,
  ) {
    await this.bookmarksService.removeBookmark(req.user.id, tenderId);
    return { success: true };
  }

  @Get('check/:tenderId')
  async isBookmarked(@Request() req: any, @Param('tenderId') tenderId: string) {
    const isBookmarked = await this.bookmarksService.isBookmarked(
      req.user.id,
      tenderId,
    );
    return { isBookmarked };
  }

  @Get('count')
  async getBookmarkCount(@Request() req: any) {
    const count = await this.bookmarksService.getBookmarkCount(req.user.id);
    return { count };
  }

  // Notes endpoints
  @Post('notes')
  async addNote(
    @Request() req: any,
    @Body() body: { tenderId: string; content: string },
  ) {
    return this.bookmarksService.addNote(
      req.user.id,
      body.tenderId,
      body.content,
    );
  }

  @Get('notes/:tenderId')
  async getNotes(@Request() req: any, @Param('tenderId') tenderId: string) {
    return this.bookmarksService.getNotes(req.user.id, tenderId);
  }

  @Post('notes/:noteId')
  async updateNote(
    @Request() req: any,
    @Param('noteId') noteId: string,
    @Body() body: { content: string },
  ) {
    return this.bookmarksService.updateNote(req.user.id, noteId, body.content);
  }

  @Delete('notes/:noteId')
  async deleteNote(@Request() req: any, @Param('noteId') noteId: string) {
    await this.bookmarksService.deleteNote(req.user.id, noteId);
    return { success: true };
  }
}
