import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './saved-searches.dto';
export declare class SavedSearchesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        criteria: string;
        alertsEnabled: boolean;
        alertFrequency: string;
        lastAlertedAt: Date | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        criteria: string;
        alertsEnabled: boolean;
        alertFrequency: string;
        lastAlertedAt: Date | null;
    }>;
    create(userId: string, dto: CreateSavedSearchDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        criteria: string;
        alertsEnabled: boolean;
        alertFrequency: string;
        lastAlertedAt: Date | null;
    }>;
    update(id: string, userId: string, dto: UpdateSavedSearchDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        criteria: string;
        alertsEnabled: boolean;
        alertFrequency: string;
        lastAlertedAt: Date | null;
    }>;
    delete(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    getMatchCount(id: string, userId: string): Promise<{
        count: number;
    }>;
}
