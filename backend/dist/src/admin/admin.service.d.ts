import { PrismaService } from '../prisma';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getUsers(page?: number, limit?: number, search?: string): Promise<{
        users: {
            id: string;
            createdAt: Date;
            name: string | null;
            email: string;
            role: string;
            subscription: {
                status: string;
                endDate: Date | null;
                plan: string;
                startDate: Date;
            } | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        email: string;
        role: string;
        savedSearches: {
            id: string;
            createdAt: Date;
            name: string;
        }[];
        subscription: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            endDate: Date | null;
            userId: string;
            plan: string;
            startDate: Date;
            teamSize: number;
        } | null;
    }>;
    updateSubscription(userId: string, plan: string, status?: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        endDate: Date | null;
        userId: string;
        plan: string;
        startDate: Date;
        teamSize: number;
    }>;
    updateRole(userId: string, role: string): Promise<{
        id: string;
        name: string | null;
        email: string;
        role: string;
    }>;
    deleteUser(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
