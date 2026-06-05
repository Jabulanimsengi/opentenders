import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { EmailService } from '../email/email.service';
import { getPlanSeatLimit } from '../subscriptions/plans';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async getTeam(userId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { ownerId: userId },
      include: {
        subscription: true,
        members: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!organization) {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });
      return {
        organization: null,
        subscription,
        members: [],
        seatLimit: subscription ? getPlanSeatLimit(subscription.plan) : 1,
      };
    }

    return {
      organization,
      subscription: organization.subscription,
      members: organization.members,
      seatLimit: organization.subscription
        ? getPlanSeatLimit(organization.subscription.plan)
        : 1,
    };
  }

  async inviteMember(userId: string, email: string, role = 'member') {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new BadRequestException('A valid email address is required');
    }

    const owner = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!owner) throw new ForbiddenException('User not found');
    if (!owner.subscription || owner.subscription.status !== 'active') {
      throw new ForbiddenException('A paid team plan is required');
    }

    const seatLimit = getPlanSeatLimit(owner.subscription.plan);
    if (seatLimit === 1) {
      throw new ForbiddenException('Upgrade to Team or higher to add users');
    }

    const organization = await this.prisma.organization.upsert({
      where: { id: userId },
      create: {
        id: userId,
        name: owner.name ? `${owner.name}'s team` : `${owner.email} team`,
        ownerId: userId,
        members: {
          create: {
            userId,
            invitedEmail: owner.email,
            role: 'owner',
            status: 'active',
            joinedAt: new Date(),
          },
        },
      },
      update: {},
    });

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        organizationId: organization.id,
        teamSize: seatLimit,
      },
    });

    const currentSeats = await this.prisma.organizationMember.count({
      where: {
        organizationId: organization.id,
        status: { in: ['active', 'invited'] },
      },
    });

    if (seatLimit !== -1 && currentSeats >= seatLimit) {
      throw new ForbiddenException('Plan user limit reached');
    }

    const invitedUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const member = await this.prisma.organizationMember.upsert({
      where: {
        organizationId_invitedEmail: {
          organizationId: organization.id,
          invitedEmail: normalizedEmail,
        },
      },
      create: {
        organizationId: organization.id,
        userId: invitedUser?.id,
        invitedEmail: normalizedEmail,
        role,
        status: invitedUser ? 'active' : 'invited',
        joinedAt: invitedUser ? new Date() : undefined,
      },
      update: {
        userId: invitedUser?.id,
        role,
        status: invitedUser ? 'active' : 'invited',
        joinedAt: invitedUser ? new Date() : undefined,
      },
    });

    await this.emailService.sendTeamInvite(
      normalizedEmail,
      owner.name || owner.email,
      organization.name,
    );

    return member;
  }
}
