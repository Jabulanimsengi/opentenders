export declare class CreateSavedSearchDto {
    name: string;
    criteria: {
        q?: string;
        region?: string[];
        category?: string[];
        buyer?: string[];
        status?: string[];
    };
}
export declare class UpdateSavedSearchDto {
    name?: string;
    criteria?: {
        q?: string;
        region?: string[];
        category?: string[];
        buyer?: string[];
        status?: string[];
    };
}
