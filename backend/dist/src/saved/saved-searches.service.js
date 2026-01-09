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
exports.SavedSearchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SavedSearchesService = class SavedSearchesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.savedSearch.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const search = await this.prisma.savedSearch.findUnique({
            where: { id },
        });
        if (!search) {
            throw new common_1.NotFoundException('Saved search not found');
        }
        if (search.userId !== userId) {
            throw new common_1.ForbiddenException('Not authorized');
        }
        return search;
    }
    async create(userId, dto) {
        return this.prisma.savedSearch.create({
            data: {
                name: dto.name,
                criteria: JSON.stringify(dto.criteria),
                userId,
            },
        });
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.savedSearch.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.criteria && { criteria: JSON.stringify(dto.criteria) }),
            },
        });
    }
    async delete(id, userId) {
        await this.findOne(id, userId);
        await this.prisma.savedSearch.delete({
            where: { id },
        });
        return { success: true };
    }
    async getMatchCount(id, userId) {
        const search = await this.findOne(id, userId);
        const criteria = JSON.parse(search.criteria);
        const where = { status: 'active' };
        if (criteria.q) {
            where.OR = [
                { title: { contains: criteria.q } },
                { description: { contains: criteria.q } },
            ];
        }
        if (criteria.region?.length) {
            where.region = { in: criteria.region };
        }
        if (criteria.category?.length) {
            where.category = { in: criteria.category };
        }
        if (criteria.buyer?.length) {
            where.buyerName = { in: criteria.buyer };
        }
        const count = await this.prisma.tender.count({ where });
        return { count };
    }
};
exports.SavedSearchesService = SavedSearchesService;
exports.SavedSearchesService = SavedSearchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SavedSearchesService);
//# sourceMappingURL=saved-searches.service.js.map