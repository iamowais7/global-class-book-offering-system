import { Offering } from './offering.entity';
import { User } from './user.entity';
export declare class Session {
    id: string;
    offeringId: string;
    offering: Offering;
    teacherId: string;
    teacher: User;
    startTime: Date;
    endTime: Date;
    createdAt: Date;
}
