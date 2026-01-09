'use client';

import { DownloadPDFButton } from './download-pdf-button';

interface TenderDetails {
    title: string;
    description: string;
    buyerName: string;
    region?: string | null;
    category?: string | null;
    closingDate: string | null;
    publishedDate: string | null;
    status: string;
    ocid: string;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    briefingDate?: string | null;
    briefingVenue?: string | null;
    briefingCompulsory?: boolean;
    estimatedValue?: number | null;
    currency?: string;
    eligibilityCriteria?: string | null;
    specialConditions?: string | null;
}

interface DownloadPDFWrapperProps {
    tender: TenderDetails;
    isLoggedIn: boolean;
}

export function DownloadPDFWrapper({ tender, isLoggedIn }: DownloadPDFWrapperProps) {
    if (!isLoggedIn) {
        return null; // Only show for logged-in users
    }

    return <DownloadPDFButton tender={tender} />;
}
