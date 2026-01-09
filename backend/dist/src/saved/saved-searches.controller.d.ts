import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './saved-searches.dto';
export declare class SavedSearchesController {
    private readonly savedSearchesService;
    constructor(savedSearchesService: SavedSearchesService);
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        criteria: string;
        alertsEnabled: boolean;
        alertFrequency: string;
        lastAlertedAt: Date | null;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        criteria: string;
        alertsEnabled: boolean;
        alertFrequency: string;
        lastAlertedAt: Date | null;
    }>;
    getMatchCount(id: string, req: any): Promise<{
        count: number;
    }>;
    create(dto: CreateSavedSearchDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        criteria: string;
        alertsEnabled: boolean;
        alertFrequency: string;
        lastAlertedAt: Date | null;
    }>;
    update(id: string, dto: UpdateSavedSearchDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        criteria: string;
        alertsEnabled: boolean;
        alertFrequency: string;
        lastAlertedAt: Date | null;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
