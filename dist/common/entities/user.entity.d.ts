import { UserRole } from '../enums/user-role.enum';
export declare class User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    timezone: string;
    createdAt: Date;
}
