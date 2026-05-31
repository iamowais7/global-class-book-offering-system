import { Repository } from 'typeorm';
import { Offering } from '../common/entities/offering.entity';
import { Session } from '../common/entities/session.entity';
import { User } from '../common/entities/user.entity';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { AddSessionsDto } from './dto/add-sessions.dto';
export declare class TeachersService {
    private readonly offeringRepo;
    private readonly sessionRepo;
    constructor(offeringRepo: Repository<Offering>, sessionRepo: Repository<Session>);
    createOffering(teacher: User, dto: CreateOfferingDto): Promise<Offering>;
    addSessions(teacher: User, offeringId: string, dto: AddSessionsDto): Promise<Session[]>;
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
    private formatSessionForTeacher;
}
