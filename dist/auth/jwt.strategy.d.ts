import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepo;
    private readonly configService;
    constructor(userRepo: Repository<User>, configService: ConfigService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<User>;
}
export {};
