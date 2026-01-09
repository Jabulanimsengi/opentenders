import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './saved-searches.dto';

@Injectable()
export class SavedSearchesService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        return this.prisma.savedSearch.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const search = await this.prisma.savedSearch.findUnique({
            where: { id },
        });

        if (!search) {
            throw new NotFoundException('Saved search not found');
        }

        if (search.userId !== userId) {
            throw new ForbiddenException('Not authorized');
        }

        return search;
    }

    async create(userId: string, dto: CreateSavedSearchDto) {
        return this.prisma.savedSearch.create({
            data: {
                name: dto.name,
                criteria: JSON.stringify(dto.criteria),
                userId,
            },
        });
    }

    async update(id: string, userId: string, dto: UpdateSavedSearchDto) {
        await this.findOne(id, userId); // Verify ownership

        return this.prisma.savedSearch.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.criteria && { criteria: JSON.stringify(dto.criteria) }),
            },
        });
    }

    async delete(id: string, userId: string) {
        await this.findOne(id, userId); // Verify ownership

        await this.prisma.savedSearch.delete({
            where: { id },
        });

        return { success: true };
    }

    async getMatchCount(id: string, userId: string) {
        const search = await this.findOne(id, userId);
        const criteria = JSON.parse(search.criteria);

        // Build query based on criteria
        const where: any = { status: 'active' };

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
}
