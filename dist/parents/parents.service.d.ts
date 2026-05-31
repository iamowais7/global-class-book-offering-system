import { DataSource, Repository } from 'typeorm';
import { Offering } from '../common/entities/offering.entity';
import { Session } from '../common/entities/session.entity';
import { Booking } from '../common/entities/booking.entity';
import { User } from '../common/entities/user.entity';
import { BookOfferingDto } from './dto/book-offering.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';
export declare class ParentsService {
    private readonly offeringRepo;
    private readonly sessionRepo;
    private readonly bookingRepo;
    private readonly dataSource;
    constructor(offeringRepo: Repository<Offering>, sessionRepo: Repository<Session>, bookingRepo: Repository<Booking>, dataSource: DataSource);
    getAvailableOfferings(parent: User): Promise<{
        id: string;
        courseName: string;
        name: string;
        description: string;
        teacher: {
            id: string;
            name: string;
            timezone: string;
        };
        sessions: {
            id: string;
            offeringId: string;
            teacherId: string;
            startTime: string | null;
            endTime: string | null;
            date: string;
            timeRange: string;
        }[];
        totalSessions: number;
    }[]>;
    bookOffering(parent: User, dto: BookOfferingDto): Promise<{
        id: string;
        offeringId: string;
        parentId: string;
        status: BookingStatus;
        createdAt: Date;
        offering: {
            id: string;
            courseName: string;
            name: string;
        };
        sessions: {
            id: string;
            offeringId: string;
            teacherId: string;
            startTime: string | null;
            endTime: string | null;
            date: string;
            timeRange: string;
        }[];
    }>;
    getMyBookings(parent: User): Promise<{
        id: string;
        status: BookingStatus;
        bookedAt: Date;
        offering: {
            id: string;
            courseName: string;
            name: string;
            description: string;
            teacher: {
                id: string;
                name: string;
            };
        };
        sessions: {
            id: string;
            offeringId: string;
            teacherId: string;
            startTime: string | null;
            endTime: string | null;
            date: string;
            timeRange: string;
        }[];
    }[]>;
    private formatSessionForParent;
}
