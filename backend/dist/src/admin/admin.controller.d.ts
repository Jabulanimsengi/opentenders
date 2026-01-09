import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getUsers(page?: string, limit?: string, search?: string): Promise<{
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
    getUser(id: string): Promise<{
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
    updateSubscription(id: string, body: {
        plan: string;
        status?: string;
    }): Promise<{
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
    updateRole(id: string, body: {
        role: string;
    }): Promise<{
        id: string;
        name: string | null;
        email: string;
        role: string;
    }>;
    deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
