'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

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

interface ExportCSVButtonProps {
    tenders: Tender[];
    filename?: string;
    disabled?: boolean;
}

export function ExportCSVButton({ tenders, filename = 'tenders', disabled = false }: ExportCSVButtonProps) {
    const [exporting, setExporting] = useState(false);

    const exportToCSV = () => {
        if (tenders.length === 0) return;

        setExporting(true);

        try {
            // CSV Headers
            const headers = ['Title', 'Buyer', 'Region', 'Category', 'Closing Date', 'Status', 'OCID'];

            // CSV Rows
            const rows = tenders.map(tender => [
                `"${(tender.title || '').replace(/"/g, '""')}"`,
                `"${(tender.buyerName || '').replace(/"/g, '""')}"`,
                `"${(tender.region || '').replace(/"/g, '""')}"`,
                `"${(tender.category || '').replace(/"/g, '""')}"`,
                tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : 'N/A',
                tender.status || 'N/A',
                tender.ocid || ''
            ]);

            // Combine headers and rows
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={disabled || exporting || tenders.length === 0}
            className="gap-2"
        >
            {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4" />
            )}
            Export CSV
        </Button>
    );
}
