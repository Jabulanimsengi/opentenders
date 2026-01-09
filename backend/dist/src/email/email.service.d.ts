export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private readonly logger;
    private readonly fromEmail;
    private readonly fromName;
    constructor();
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendTenderMatchAlert(to: string, userName: string, searchName: string, tenders: {
        title: string;
        closingDate: string | null;
        slug: string;
    }[]): Promise<boolean>;
    sendClosingReminder(to: string, userName: string, tender: {
        title: string;
        closingDate: string;
        slug: string;
        daysRemaining: number;
    }): Promise<boolean>;
}
