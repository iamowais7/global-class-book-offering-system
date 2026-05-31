import { TeachersService } from './teachers.service';
import { User } from '../common/entities/user.entity';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { AddSessionsDto } from './dto/add-sessions.dto';
export declare class TeachersController {
    private readonly teachersService;
    constructor(teachersService: TeachersService);
    createOffering(teacher: User, dto: CreateOfferingDto): Promise<import("../common/entities/offering.entity").Offering>;
    addSessions(teacher: User, offeringId: string, dto: AddSessionsDto): Promise<import("../common/entities/session.entity").Session[]>;
    getMyOfferings(teacher: User): Promise<{
        id: string;
        courseName: string;
        name: string;
        description: string;
        teacherTimezone: string;
        createdAt: Date;
        sessions: {
            id: string;
            offeringId: string;
            teacherId: string;
            startTime: string | null;
            endTime: string | null;
            startTimeUtc: string;
            endTimeUtc: string;
        }[];
        upcomingSessionsCount: number;
        totalSessionsCount: number;
    }[]>;
}
