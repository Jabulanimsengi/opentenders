import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';
import { LoginDto, RegisterDto } from './dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string | null;
            email: string;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string | null;
            email: string;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        email: string;
    }>;
}
