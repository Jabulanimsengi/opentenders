import { PrismaService } from '../prisma';
import { TenderQueryDto } from './dto';
export declare class TendersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(slugOrId: string): Promise<{
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
    } | null>;
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
}
