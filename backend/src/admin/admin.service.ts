import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // Get all users with pagination and search
    async getUsers(page: number = 1, limit: number = 20, search?: string) {
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { email: { contains: search } },
                    { name: { contains: search } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    subscription: {
                        select: {
                            plan: true,
                            status: true,
                            startDate: true,
                            endDate: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Get single user details
    async getUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                subscription: true,
                savedSearches: {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    // Update user's subscription
    async updateSubscription(
        userId: string,
        plan: string,
        status: string = 'active',
    ) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Upsert subscription
        const subscription = await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                plan,
                status,
                startDate: new Date(),
            },
            update: {
                plan,
                status,
                updatedAt: new Date(),
            },
        });

        return subscription;
    }

    // Update user role
    async updateRole(userId: string, role: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
    }

    // Delete user and all related data
    async deleteUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Delete user (cascades to subscription, saved searches, etc.)
        await this.prisma.user.delete({
            where: { id: userId },
        });

        return { success: true, message: 'User deleted successfully' };
    }
}
