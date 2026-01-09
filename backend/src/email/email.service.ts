import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly fromEmail = process.env.SENDGRID_FROM_EMAIL || 'alerts@opentenderportal.co.za';
    private readonly fromName = 'Open Tender Portal';

    constructor() {
        const apiKey = process.env.SENDGRID_API_KEY;
        if (apiKey) {
            sgMail.setApiKey(apiKey);
            this.logger.log('SendGrid initialized');
        } else {
            this.logger.warn('SENDGRID_API_KEY not set - emails will not be sent');
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!process.env.SENDGRID_API_KEY) {
            this.logger.warn(`Email not sent (no API key): ${options.subject} to ${options.to}`);
            return false;
        }

        try {
            await sgMail.send({
                to: options.to,
                from: { email: this.fromEmail, name: this.fromName },
                subject: options.subject,
                html: options.html,
                text: options.text || options.subject,
            });
            this.logger.log(`Email sent: ${options.subject} to ${options.to}`);
            return true;
        } catch (error: any) {
            this.logger.error(`Failed to send email: ${error.message}`);
            return false;
        }
    }

    // Email templates
    async sendTenderMatchAlert(
        to: string,
        userName: string,
        searchName: string,
        tenders: { title: string; closingDate: string | null; slug: string }[],
    ): Promise<boolean> {
        const tenderList = tenders
            .map(t => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <a href="${process.env.FRONTEND_URL}/tenders/${t.slug}" style="color: #10b981; text-decoration: none; font-weight: 500;">
                            ${t.title}
                        </a>
                        ${t.closingDate ? `<br><small style="color: #666;">Closes: ${t.closingDate}</small>` : ''}
                    </td>
                </tr>
            `)
            .join('');

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 24px; text-align: center;">
                    <h1 style="color: #10b981; margin: 0; font-size: 24px;">Open Tender Portal</h1>
                </div>
                <div style="padding: 24px; background: #fff;">
                    <p style="color: #333; font-size: 16px;">Hi ${userName},</p>
                    <p style="color: #666;">We found <strong>${tenders.length} new tender(s)</strong> matching your saved search "<strong>${searchName}</strong>":</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        ${tenderList}
                    </table>
                    <a href="${process.env.FRONTEND_URL}/saved-searches" 
                       style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                        View All Matches
                    </a>
                </div>
                <div style="padding: 16px 24px; background: #f8fafc; text-align: center; color: #94a3b8; font-size: 12px;">
                    <p>You're receiving this because you have email alerts enabled for "${searchName}".</p>
                    <a href="${process.env.FRONTEND_URL}/settings" style="color: #64748b;">Manage alert preferences</a>
                </div>
            </div>
        `;

        return this.sendEmail({
            to,
            subject: `${tenders.length} New Tender(s) Match "${searchName}"`,
            html,
        });
    }

    async sendClosingReminder(
        to: string,
        userName: string,
        tender: { title: string; closingDate: string; slug: string; daysRemaining: number },
    ): Promise<boolean> {
        const urgencyColor = tender.daysRemaining <= 1 ? '#ef4444' : tender.daysRemaining <= 3 ? '#f59e0b' : '#10b981';

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 24px; text-align: center;">
                    <h1 style="color: #10b981; margin: 0; font-size: 24px;">Open Tender Portal</h1>
                </div>
                <div style="padding: 24px; background: #fff;">
                    <p style="color: #333; font-size: 16px;">Hi ${userName},</p>
                    <div style="background: ${urgencyColor}15; border-left: 4px solid ${urgencyColor}; padding: 16px; margin: 16px 0;">
                        <p style="margin: 0; color: ${urgencyColor}; font-weight: 600;">
                            ⏰ ${tender.daysRemaining} day(s) remaining!
                        </p>
                    </div>
                    <p style="color: #666;">The following tender closes on <strong>${tender.closingDate}</strong>:</p>
                    <h3 style="color: #1e293b; margin: 16px 0;">${tender.title}</h3>
                    <a href="${process.env.FRONTEND_URL}/tenders/${tender.slug}" 
                       style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                        View Tender Details
                    </a>
                </div>
                <div style="padding: 16px 24px; background: #f8fafc; text-align: center; color: #94a3b8; font-size: 12px;">
                    <a href="${process.env.FRONTEND_URL}/settings" style="color: #64748b;">Manage alert preferences</a>
                </div>
            </div>
        `;

        return this.sendEmail({
            to,
            subject: `⏰ Tender Closing in ${tender.daysRemaining} Day(s): ${tender.title.substring(0, 50)}...`,
            html,
        });
    }
}
