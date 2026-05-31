import { User } from './user.entity';
import { Offering } from './offering.entity';
import { BookingStatus } from '../enums/booking-status.enum';
export declare class Booking {
    id: string;
    parentId: string;
    parent: User;
    offeringId: string;
    offering: Offering;
    status: BookingStatus;
    createdAt: Date;
}
