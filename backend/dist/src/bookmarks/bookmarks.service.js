"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BookmarksService = class BookmarksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBookmarks(userId) {
        const bookmarks = await this.prisma.bookmark.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
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
    async addBookmark(userId, tenderId) {
        const tender = await this.prisma.tender.findUnique({
            where: { id: tenderId },
        });
        if (!tender) {
            throw new Error('Tender not found');
        }
        return this.prisma.bookmark.upsert({
            where: {
                userId_tenderId: { userId, tenderId },
            },
            update: {},
            create: { userId, tenderId },
        });
    }
    async removeBookmark(userId, tenderId) {
        return this.prisma.bookmark.deleteMany({
            where: { userId, tenderId },
        });
    }
    async isBookmarked(userId, tenderId) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                userId_tenderId: { userId, tenderId },
            },
        });
        return !!bookmark;
    }
    async getBookmarkCount(userId) {
        return this.prisma.bookmark.count({
            where: { userId },
        });
    }
    async addNote(userId, tenderId, content) {
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
    async getNotes(userId, tenderId) {
        return this.prisma.tenderNote.findMany({
            where: { userId, tenderId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateNote(userId, noteId, content) {
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
    async deleteNote(userId, noteId) {
        return this.prisma.tenderNote.deleteMany({
            where: { id: noteId, userId },
        });
    }
};
exports.BookmarksService = BookmarksService;
exports.BookmarksService = BookmarksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookmarksService);
//# sourceMappingURL=bookmarks.service.js.map