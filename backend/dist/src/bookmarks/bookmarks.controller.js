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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarksController = void 0;
const common_1 = require("@nestjs/common");
const bookmarks_service_1 = require("./bookmarks.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BookmarksController = class BookmarksController {
    bookmarksService;
    constructor(bookmarksService) {
        this.bookmarksService = bookmarksService;
    }
    async getBookmarks(req) {
        return this.bookmarksService.getBookmarks(req.user.id);
    }
    async addBookmark(req, body) {
        return this.bookmarksService.addBookmark(req.user.id, body.tenderId);
    }
    async removeBookmark(req, tenderId) {
        await this.bookmarksService.removeBookmark(req.user.id, tenderId);
        return { success: true };
    }
    async isBookmarked(req, tenderId) {
        const isBookmarked = await this.bookmarksService.isBookmarked(req.user.id, tenderId);
        return { isBookmarked };
    }
    async getBookmarkCount(req) {
        const count = await this.bookmarksService.getBookmarkCount(req.user.id);
        return { count };
    }
    async addNote(req, body) {
        return this.bookmarksService.addNote(req.user.id, body.tenderId, body.content);
    }
    async getNotes(req, tenderId) {
        return this.bookmarksService.getNotes(req.user.id, tenderId);
    }
    async updateNote(req, noteId, body) {
        return this.bookmarksService.updateNote(req.user.id, noteId, body.content);
    }
    async deleteNote(req, noteId) {
        await this.bookmarksService.deleteNote(req.user.id, noteId);
        return { success: true };
    }
};
exports.BookmarksController = BookmarksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "getBookmarks", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "addBookmark", null);
__decorate([
    (0, common_1.Delete)(':tenderId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('tenderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "removeBookmark", null);
__decorate([
    (0, common_1.Get)('check/:tenderId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('tenderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "isBookmarked", null);
__decorate([
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "getBookmarkCount", null);
__decorate([
    (0, common_1.Post)('notes'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "addNote", null);
__decorate([
    (0, common_1.Get)('notes/:tenderId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('tenderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "getNotes", null);
__decorate([
    (0, common_1.Post)('notes/:noteId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('noteId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "updateNote", null);
__decorate([
    (0, common_1.Delete)('notes/:noteId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('noteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "deleteNote", null);
exports.BookmarksController = BookmarksController = __decorate([
    (0, common_1.Controller)('bookmarks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bookmarks_service_1.BookmarksService])
], BookmarksController);
//# sourceMappingURL=bookmarks.controller.js.map