import { TendersService } from './tenders.service';
import { TenderQueryDto } from './dto';
export declare class TendersController {
    private tendersService;
    constructor(tendersService: TendersService);
    findAll(query: TenderQueryDto): Promise<{
        data: {
            id: string;
            ocid: string;
            slug: string | null;
            publishedDate: Date;
            title: string;
            description: string | null;
            status: string | null;
            category: string | null;
            region: string | null;
            closingDate: Date | null;
            briefingDate: Date | null;
            buyerName: string | null;
            rawData: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        totalCount: number;
        newThisWeek: number;
        closingSoon: number;
        activeCount: number;
        closedCount: number;
        cancelledCount: number;
        awardedCount: number;
    }>;
    getFacets(): Promise<{
        regions: {
            value: any;
            count: any;
        }[];
        categories: {
            value: any;
            count: any;
        }[];
        buyers: {
            value: any;
            count: any;
        }[];
    }>;
    findOne(slug: string): Promise<{
        id: string;
        ocid: string;
        slug: string | null;
        publishedDate: Date;
        title: string;
        description: string | null;
        status: string | null;
        category: string | null;
        region: string | null;
        closingDate: Date | null;
        briefingDate: Date | null;
        buyerName: string | null;
        rawData: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
