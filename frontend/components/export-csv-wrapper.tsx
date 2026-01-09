'use client';

import { ExportCSVButton } from './export-csv-button';

interface Tender {
    id: string;
    title: string;
    buyerName: string;
    region: string;
    category: string;
    closingDate: string | null;
    status: string;
    ocid: string;
}

interface ExportCSVWrapperProps {
    tenders: Tender[];
    isLoggedIn: boolean;
}

export function ExportCSVWrapper({ tenders, isLoggedIn }: ExportCSVWrapperProps) {
    if (!isLoggedIn) {
        return null; // Only show for logged-in users
    }

    return <ExportCSVButton tenders={tenders} filename="open-tenders-export" />;
}
