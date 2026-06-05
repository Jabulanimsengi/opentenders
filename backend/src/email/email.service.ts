import { Injectable, Logger } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail =
    process.env.RESEND_FROM_EMAIL || 'alerts@opentenderportal.co.za';
  private readonly fromName =
    process.env.RESEND_FROM_NAME || 'Open Tender Portal';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.logger.log('Resend initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not set - emails will not be sent');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        `Email not sent (no API key): ${options.subject} to ${options.to}`,
      );
      return false;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text || options.subject,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend API ${response.status}: ${body}`);
      }

      this.logger.log(`Email sent: ${options.subject} to ${options.to}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email: ${message}`);
      return false;
    }
  }

  // Email templates
  async sendEmailVerification(
    to: string,
    userName: string,
    token: string,
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0f172a; padding: 24px; text-align: center;">
                    <h1 style="color: #10b981; margin: 0; font-size: 24px;">Open Tenders</h1>
                </div>
                <div style="padding: 24px; background: #fff;">
                    <p style="color: #333; font-size: 16px;">Hi ${userName},</p>
                    <p style="color: #666;">Please verify your email address to activate your Open Tenders account.</p>
                    <a href="${verifyUrl}"
                       style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                        Verify Email
                    </a>
                    <p style="color: #64748b; font-size: 12px; margin-top: 20px;">This link expires in 24 hours.</p>
                </div>
            </div>
        `;

    return this.sendEmail({
      to,
      subject: 'Verify your Open Tenders email address',
      html,
      text: `Verify your Open Tenders email address: ${verifyUrl}`,
    });
  }

  async sendTenderMatchAlert(
    to: string,
    userName: string,
    searchName: string,
    tenders: { title: string; closingDate: string | null; slug: string }[],
  ): Promise<boolean> {
    const tenderList = tenders
      .map(
        (t) => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <a href="${process.env.FRONTEND_URL}/tenders/${t.slug}" style="color: #10b981; text-decoration: none; font-weight: 500;">
                            ${t.title}
                        </a>
                        ${t.closingDate ? `<br><small style="color: #666;">Closes: ${t.closingDate}</small>` : ''}
                    </td>
                </tr>
            `,
      )
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
    tender: {
      title: string;
      closingDate: string;
      slug: string;
      daysRemaining: number;
    },
  ): Promise<boolean> {
    const urgencyColor =
      tender.daysRemaining <= 1
        ? '#ef4444'
        : tender.daysRemaining <= 3
          ? '#f59e0b'
          : '#10b981';

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

  async sendTeamInvite(
    to: string,
    inviterName: string,
    organizationName: string,
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0f172a; padding: 24px; text-align: center;">
                    <h1 style="color: #10b981; margin: 0; font-size: 24px;">Open Tenders</h1>
                </div>
                <div style="padding: 24px; background: #fff;">
                    <p style="color: #333; font-size: 16px;">${inviterName} invited you to join ${organizationName} on Open Tenders.</p>
                    <a href="${frontendUrl}/team"
                       style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                        Open Team Dashboard
                    </a>
                </div>
            </div>
        `;

    return this.sendEmail({
      to,
      subject: `You're invited to join ${organizationName} on Open Tenders`,
      html,
    });
  }
}
