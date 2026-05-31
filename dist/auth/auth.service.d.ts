import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../common/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../common/enums/user-role.enum").UserRole;
            timezone: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../common/enums/user-role.enum").UserRole;
            timezone: string;
        };
    }>;
    private buildTokenResponse;
}
