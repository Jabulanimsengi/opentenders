'use client';

import { Button } from '@/components/ui/button';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { FileText, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

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

interface DownloadPDFButtonProps {
    tender: TenderDetails;
    disabled?: boolean;
}

export function DownloadPDFButton({ tender, disabled = false }: DownloadPDFButtonProps) {
    const { data: session } = useSession();
    const [downloading, setDownloading] = useState(false);
    const accessToken = (session as { accessToken?: string } | null)?.accessToken;

    const generatePDF = async () => {
        setDownloading(true);
        trackAnalyticsEvent(
            {
                eventName: 'document_download',
                entityType: 'tender',
                entityId: tender.ocid,
                metadata: { format: 'pdf', title: tender.title },
            },
            accessToken,
        );

        try {
            // Generate HTML content for PDF
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${tender.title}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #1e293b; font-size: 24px; margin-bottom: 20px; }
        .meta { color: #64748b; font-size: 12px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; color: #059669; font-size: 14px; margin-bottom: 8px; border-bottom: 2px solid #d1fae5; padding-bottom: 4px; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: 600; color: #475569; display: inline-block; width: 150px; }
        .field-value { color: #1e293b; }
        .description { line-height: 1.6; color: #334155; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-active { background: #dcfce7; color: #166534; }
        .badge-closed { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
    </style>
</head>
<body>
    <h1>${tender.title}</h1>
    <div class="meta">
        Reference: ${tender.ocid} | Generated: ${new Date().toLocaleDateString()}
    </div>

    <div class="section">
        <div class="section-title">Overview</div>
        <div class="field"><span class="field-label">Buyer:</span> <span class="field-value">${tender.buyerName}</span></div>
        <div class="field"><span class="field-label">Region:</span> <span class="field-value">${tender.region}</span></div>
        <div class="field"><span class="field-label">Category:</span> <span class="field-value">${tender.category}</span></div>
        <div class="field"><span class="field-label">Status:</span> <span class="badge ${tender.status === 'active' ? 'badge-active' : 'badge-closed'}">${tender.status?.toUpperCase()}</span></div>
        ${tender.estimatedValue ? `<div class="field"><span class="field-label">Estimated Value:</span> <span class="field-value">${tender.currency || 'ZAR'} ${tender.estimatedValue.toLocaleString()}</span></div>` : ''}
    </div>

    <div class="section">
        <div class="section-title">Important Dates</div>
        <div class="field"><span class="field-label">Advertised:</span> <span class="field-value">${tender.publishedDate ? new Date(tender.publishedDate).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span></div>
        <div class="field"><span class="field-label">Closing Date:</span> <span class="field-value">${tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : 'N/A'}</span></div>
        ${tender.briefingDate ? `<div class="field"><span class="field-label">Briefing Date:</span> <span class="field-value">${new Date(tender.briefingDate).toLocaleDateString()}${tender.briefingCompulsory ? ' (Compulsory)' : ''}</span></div>` : ''}
        ${tender.briefingVenue ? `<div class="field"><span class="field-label">Briefing Venue:</span> <span class="field-value">${tender.briefingVenue}</span></div>` : ''}
    </div>

    ${tender.description ? `
    <div class="section">
        <div class="section-title">Description</div>
        <div class="description">${tender.description}</div>
    </div>
    ` : ''}

    ${(tender.contactName || tender.contactEmail || tender.contactPhone) ? `
    <div class="section">
        <div class="section-title">Contact Information</div>
        ${tender.contactName ? `<div class="field"><span class="field-label">Name:</span> <span class="field-value">${tender.contactName}</span></div>` : ''}
        ${tender.contactEmail ? `<div class="field"><span class="field-label">Email:</span> <span class="field-value">${tender.contactEmail}</span></div>` : ''}
        ${tender.contactPhone ? `<div class="field"><span class="field-label">Phone:</span> <span class="field-value">${tender.contactPhone}</span></div>` : ''}
    </div>
    ` : ''}

    ${tender.eligibilityCriteria ? `
    <div class="section">
        <div class="section-title">Eligibility Criteria</div>
        <div class="description">${tender.eligibilityCriteria}</div>
    </div>
    ` : ''}

    ${tender.specialConditions ? `
    <div class="section">
        <div class="section-title">Special Conditions</div>
        <div class="description">${tender.specialConditions}</div>
    </div>
    ` : ''}

    <div class="footer">
        This document was generated from Open Tenders (opentenders.co.za). 
        For the most up-to-date information, please visit the official eTenders portal.
    </div>
</body>
</html>`;

            // Open print dialog which allows saving as PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            }
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={generatePDF}
            disabled={disabled || downloading}
            className="gap-2"
        >
            {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <FileText className="w-4 h-4" />
            )}
            Download PDF
        </Button>
    );
}
