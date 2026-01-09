import { PrismaService } from '../prisma/prisma.service';
export declare class BookmarksService {
    private prisma;
    constructor(prisma: PrismaService);
    getBookmarks(userId: string): Promise<{
        tender: {
            id: string;
            ocid: string;
            slug: string | null;
            title: string;
            description: string | null;
            status: string | null;
            category: string | null;
            region: string | null;
            closingDate: Date | null;
            buyerName: string | null;
        } | null;
        id: string;
        createdAt: Date;
        tenderId: string;
        userId: string;
        remindDays: number | null;
        reminded: boolean;
    }[]>;
    addBookmark(userId: string, tenderId: string): Promise<{
        id: string;
        createdAt: Date;
        tenderId: string;
        userId: string;
        remindDays: number | null;
        reminded: boolean;
    }>;
    removeBookmark(userId: string, tenderId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    isBookmarked(userId: string, tenderId: string): Promise<boolean>;
    getBookmarkCount(userId: string): Promise<number>;
    addNote(userId: string, tenderId: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenderId: string;
        content: string;
        userId: string;
        bookmarkId: string | null;
    }>;
    getNotes(userId: string, tenderId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenderId: string;
        content: string;
        userId: string;
        bookmarkId: string | null;
    }[]>;
    updateNote(userId: string, noteId: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenderId: string;
        content: string;
        userId: string;
        bookmarkId: string | null;
    }>;
    deleteNote(userId: string, noteId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
