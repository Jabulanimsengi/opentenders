import { BookmarksService } from './bookmarks.service';
export declare class BookmarksController {
    private bookmarksService;
    constructor(bookmarksService: BookmarksService);
    getBookmarks(req: any): Promise<{
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
    addBookmark(req: any, body: {
        tenderId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        tenderId: string;
        userId: string;
        remindDays: number | null;
        reminded: boolean;
    }>;
    removeBookmark(req: any, tenderId: string): Promise<{
        success: boolean;
    }>;
    isBookmarked(req: any, tenderId: string): Promise<{
        isBookmarked: boolean;
    }>;
    getBookmarkCount(req: any): Promise<{
        count: number;
    }>;
    addNote(req: any, body: {
        tenderId: string;
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenderId: string;
        content: string;
        userId: string;
        bookmarkId: string | null;
    }>;
    getNotes(req: any, tenderId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenderId: string;
        content: string;
        userId: string;
        bookmarkId: string | null;
    }[]>;
    updateNote(req: any, noteId: string, body: {
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenderId: string;
        content: string;
        userId: string;
        bookmarkId: string | null;
    }>;
    deleteNote(req: any, noteId: string): Promise<{
        success: boolean;
    }>;
}
