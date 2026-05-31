import { ParentsService } from './parents.service';
import { User } from '../common/entities/user.entity';
import { BookOfferingDto } from './dto/book-offering.dto';
export declare class ParentsController {
    private readonly parentsService;
    constructor(parentsService: ParentsService);
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
        status: import("../common/enums/booking-status.enum").BookingStatus;
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
        status: import("../common/enums/booking-status.enum").BookingStatus;
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
}
