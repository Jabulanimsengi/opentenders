export class CreateSavedSearchDto {
    name: string;
    criteria: {
        q?: string;
        region?: string[];
        category?: string[];
        buyer?: string[];
        status?: string[];
    };
}

export class UpdateSavedSearchDto {
    name?: string;
    criteria?: {
        q?: string;
        region?: string[];
        category?: string[];
        buyer?: string[];
        status?: string[];
    };
}
