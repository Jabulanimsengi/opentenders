import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        email: string;
    }>;
}
