import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password || !user.emailVerifiedAt) {
      throw new UnauthorizedException(
        'Please verify your email before signing in',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        authProvider: 'email',
      },
    });

    const token = randomBytes(32).toString('hex');
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        email: user.email,
        tokenHash: this.hashToken(token),
        expiresAt: addHours(new Date(), 24),
      },
    });

    await this.emailService.sendEmailVerification(
      user.email,
      user.name || 'User',
      token,
    );

    return {
      success: true,
      message: 'Account created. Please verify your email before signing in.',
    };
  }

  async verifyEmail(token: string) {
    if (!token || token.length < 32) {
      throw new BadRequestException('Invalid verification token');
    }

    const tokenHash = this.hashToken(token);
    const verification = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!verification || verification.usedAt) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    const user = await this.prisma.user.update({
      where: { email: verification.email },
      data: { emailVerifiedAt: new Date() },
    });

    await this.prisma.emailVerificationToken.update({
      where: { id: verification.id },
      data: { usedAt: new Date(), userId: user.id },
    });

    return { success: true, message: 'Email verified. You can now sign in.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
