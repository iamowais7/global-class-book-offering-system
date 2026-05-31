import { User } from './user.entity';
export declare class Offering {
    id: string;
    courseName: string;
    name: string;
    description: string;
    teacherId: string;
    teacher: User;
    teacherTimezone: string;
    createdAt: Date;
}
