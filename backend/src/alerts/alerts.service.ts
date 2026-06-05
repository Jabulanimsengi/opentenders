import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma';
import { EmailService } from '../email/email.service';
import { format, subHours } from 'date-fns';
import { buildTenderSmartSearchCondition } from '../tenders/smart-search';
import { PLAN_DEFINITIONS } from '../subscriptions/plans';
import {
  buildActiveTenderWhere,
  isActiveTenderLike,
} from '../tenders/tender-date-rules';

const PAID_ALERT_PLANS = Object.values(PLAN_DEFINITIONS)
  .filter((plan) => plan.canReceiveEmailAlerts)
  .map((plan) => plan.id);

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // Run every day at 7:00 AM
  @Cron('0 7 * * *')
  async handleDailyAlerts() {
    this.logger.log('Starting daily email alerts job...');
    await this.processAlerts('daily');
  }

  // Run every Monday at 7:00 AM for weekly alerts
  @Cron('0 7 * * 1')
  async handleWeeklyAlerts() {
    this.logger.log('Starting weekly email alerts job...');
    await this.processAlerts('weekly');
  }

  // Manual trigger for testing
  async triggerAlertsManually(frequency: string = 'daily') {
    this.logger.log(`Manually triggering ${frequency} alerts...`);
    return this.processAlerts(frequency);
  }

  async notifyNewTender(tender: {
    id: string;
    title: string;
    slug?: string | null;
    status?: string | null;
    publishedDate?: Date | null;
    closingDate?: Date | null;
    category?: string | null;
    region?: string | null;
    buyerName?: string | null;
  }) {
    if (!tender.category) return { emailsSent: 0, searchesProcessed: 0 };
    if (!isActiveTenderLike(tender)) {
      return { emailsSent: 0, searchesProcessed: 0 };
    }

    const savedSearches = await this.prisma.savedSearch.findMany({
      where: {
        alertsEnabled: true,
        user: {
          OR: [
            {
              subscription: {
                plan: { in: PAID_ALERT_PLANS },
                status: 'active',
              },
            },
            {
              organizationMemberships: {
                some: {
                  status: 'active',
                  organization: {
                    subscription: {
                      plan: { in: PAID_ALERT_PLANS },
                      status: 'active',
                    },
                  },
                },
              },
            },
          ],
        },
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    let emailsSent = 0;
    for (const search of savedSearches) {
      const criteria = this.parseCriteria(search.criteria);
      if (!this.tenderMatchesCriteria(tender, criteria)) continue;

      const success = await this.emailService.sendTenderMatchAlert(
        search.user.email,
        search.user.name || 'User',
        search.name,
        [
          {
            title: tender.title,
            closingDate: tender.closingDate
              ? format(tender.closingDate, 'dd MMM yyyy')
              : null,
            slug: tender.slug || tender.id,
          },
        ],
      );

      if (success) {
        emailsSent++;
        await this.prisma.savedSearch.update({
          where: { id: search.id },
          data: { lastAlertedAt: new Date() },
        });
      }
    }

    return { emailsSent, searchesProcessed: savedSearches.length };
  }

  private async processAlerts(frequency: string) {
    try {
      // Get all saved searches with alerts enabled for this frequency
      // Only for paid users (non-free subscription)
      const savedSearches = await this.prisma.savedSearch.findMany({
        where: {
          alertsEnabled: true,
          alertFrequency: frequency,
          user: {
            OR: [
              {
                subscription: {
                  plan: { in: PAID_ALERT_PLANS },
                  status: 'active',
                },
              },
              {
                organizationMemberships: {
                  some: {
                    status: 'active',
                    organization: {
                      subscription: {
                        plan: { in: PAID_ALERT_PLANS },
                        status: 'active',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(
        `Found ${savedSearches.length} saved searches to process`,
      );

      let emailsSent = 0;
      let errors = 0;

      for (const search of savedSearches) {
        try {
          const newTenders = await this.findNewMatchingTenders(search);

          if (newTenders.length > 0) {
            const success = await this.emailService.sendTenderMatchAlert(
              search.user.email,
              search.user.name || 'User',
              search.name,
              newTenders,
            );

            if (success) {
              emailsSent++;
              // Update lastAlertedAt
              await this.prisma.savedSearch.update({
                where: { id: search.id },
                data: { lastAlertedAt: new Date() },
              });
            }
          }
        } catch (error) {
          this.logger.error(`Error processing search ${search.id}: ${error}`);
          errors++;
        }
      }

      this.logger.log(
        `Alerts complete: ${emailsSent} emails sent, ${errors} errors`,
      );
      return { emailsSent, errors, searchesProcessed: savedSearches.length };
    } catch (error) {
      this.logger.error(`Alert job failed: ${error}`);
      throw error;
    }
  }

  private async findNewMatchingTenders(search: {
    id: string;
    criteria: string;
    lastAlertedAt: Date | null;
  }): Promise<{ title: string; closingDate: string | null; slug: string }[]> {
    try {
      const criteria = JSON.parse(search.criteria);

      // Build PostgreSQL query
      const where: any = buildActiveTenderWhere();

      // Add date filter for new tenders since last alert
      if (search.lastAlertedAt) {
        where.publishedDate = {
          ...where.publishedDate,
          gt: search.lastAlertedAt,
        };
      } else {
        // Default to last 24 hours
        where.publishedDate = {
          ...where.publishedDate,
          gt: subHours(new Date(), 24),
        };
      }

      const searchCondition = buildTenderSmartSearchCondition(criteria.q);
      if (searchCondition) {
        where.AND = [...(where.AND ?? []), searchCondition];
      }

      // Add region filter
      if (
        criteria.region &&
        Array.isArray(criteria.region) &&
        criteria.region.length > 0
      ) {
        where.region = { in: criteria.region };
      }

      // Add category filter
      if (
        criteria.category &&
        Array.isArray(criteria.category) &&
        criteria.category.length > 0
      ) {
        where.category = { in: criteria.category };
      }

      const tenders = await this.prisma.tender.findMany({
        where,
        take: 10,
        orderBy: { publishedDate: 'desc' },
        select: {
          title: true,
          closingDate: true,
          slug: true,
          id: true,
        },
      });

      return tenders.map((tender) => ({
        title: tender.title,
        closingDate: tender.closingDate
          ? format(tender.closingDate, 'dd MMM yyyy')
          : null,
        slug: tender.slug || tender.id,
      }));
    } catch (error) {
      this.logger.error(`Search failed for search ${search.id}: ${error}`);
      return [];
    }
  }

  private parseCriteria(criteria: string) {
    try {
      return JSON.parse(criteria);
    } catch {
      return {};
    }
  }

  private tenderMatchesCriteria(
    tender: {
      title: string;
      category?: string | null;
      region?: string | null;
      buyerName?: string | null;
    },
    criteria: any,
  ) {
    if (
      criteria.category?.length &&
      !criteria.category.includes(tender.category)
    ) {
      return false;
    }

    if (criteria.region?.length && !criteria.region.includes(tender.region)) {
      return false;
    }

    if (criteria.buyer?.length && !criteria.buyer.includes(tender.buyerName)) {
      return false;
    }

    const q = Array.isArray(criteria.q) ? criteria.q.join(' ') : criteria.q;
    if (q && !tender.title.toLowerCase().includes(String(q).toLowerCase())) {
      return false;
    }

    return true;
  }
}
