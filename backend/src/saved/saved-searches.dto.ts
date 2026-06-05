export class CreateSavedSearchDto {
  name: string;
  criteria: {
    q?: string | string[];
    region?: string[];
    category?: string[];
    buyer?: string[];
    status?: string[];
  };
  alertsEnabled?: boolean;
  alertFrequency?: string;
}

export class UpdateSavedSearchDto {
  name?: string;
  criteria?: {
    q?: string | string[];
    region?: string[];
    category?: string[];
    buyer?: string[];
    status?: string[];
  };
  alertsEnabled?: boolean;
  alertFrequency?: string;
}
