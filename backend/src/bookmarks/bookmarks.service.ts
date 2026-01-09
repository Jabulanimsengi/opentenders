import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
    constructor(private prisma: PrismaService) { }

    async getBookmarks(userId: string) {
        const bookmarks = await this.prisma.bookmark.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        // Fetch tender details for each bookmark
        const tenderIds = bookmarks.map(b => b.tenderId);
        const tenders = await this.prisma.tender.findMany({
            where: { id: { in: tenderIds } },
            select: {
                id: true,
                title: true,
                description: true,
                ocid: true,
                slug: true,
                buyerName: true,
                region: true,
                category: true,
                closingDate: true,
                status: true,
            },
        });

        const tenderMap = new Map(tenders.map(t => [t.id, t]));

        return bookmarks.map(b => ({
            ...b,
            tender: tenderMap.get(b.tenderId) || null,
        }));
    }

    async addBookmark(userId: string, tenderId: string) {
        // Check if tender exists
        const tender = await this.prisma.tender.findUnique({
            where: { id: tenderId },
        });

        if (!tender) {
            throw new Error('Tender not found');
        }

        // Upsert to handle duplicate attempts gracefully
        return this.prisma.bookmark.upsert({
            where: {
                userId_tenderId: { userId, tenderId },
            },
            update: {},
            create: { userId, tenderId },
        });
    }

    async removeBookmark(userId: string, tenderId: string) {
        return this.prisma.bookmark.deleteMany({
            where: { userId, tenderId },
        });
    }

    async isBookmarked(userId: string, tenderId: string): Promise<boolean> {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                userId_tenderId: { userId, tenderId },
            },
        });
        return !!bookmark;
    }

    async getBookmarkCount(userId: string): Promise<number> {
        return this.prisma.bookmark.count({
            where: { userId },
        });
    }

    // Notes management
    async addNote(userId: string, tenderId: string, content: string) {
        // Ensure bookmark exists
        const bookmark = await this.prisma.bookmark.findUnique({
            where: { userId_tenderId: { userId, tenderId } },
        });

        if (!bookmark) {
            throw new Error('Bookmark not found. Please bookmark the tender first.');
        }

        return this.prisma.tenderNote.create({
            data: {
                userId,
                tenderId,
                bookmarkId: bookmark.id,
                content,
            },
        });
    }

    async getNotes(userId: string, tenderId: string) {
        return this.prisma.tenderNote.findMany({
            where: { userId, tenderId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateNote(userId: string, noteId: string, content: string) {
        // Ensure user owns the note
        const note = await this.prisma.tenderNote.findFirst({
            where: { id: noteId, userId },
        });

        if (!note) {
            throw new Error('Note not found');
        }

        return this.prisma.tenderNote.update({
            where: { id: noteId },
            data: { content },
        });
    }

    async deleteNote(userId: string, noteId: string) {
        return this.prisma.tenderNote.deleteMany({
            where: { id: noteId, userId },
        });
    }
}
