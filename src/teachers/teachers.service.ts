import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { Offering } from '../common/entities/offering.entity';
import { Session } from '../common/entities/session.entity';
import { User } from '../common/entities/user.entity';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { AddSessionsDto } from './dto/add-sessions.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Offering)
    private readonly offeringRepo: Repository<Offering>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async createOffering(teacher: User, dto: CreateOfferingDto) {
    const offering = this.offeringRepo.create({
      courseName: dto.courseName,
      name: dto.name,
      description: dto.description,
      teacherId: teacher.id,
      teacherTimezone: teacher.timezone,
    });
    return this.offeringRepo.save(offering);
  }

  async addSessions(teacher: User, offeringId: string, dto: AddSessionsDto) {
    const offering = await this.offeringRepo.findOne({ where: { id: offeringId } });
    if (!offering) throw new NotFoundException('Offering not found');
    if (offering.teacherId !== teacher.id) {
      throw new ForbiddenException('You do not own this offering');
    }

    const sessions = dto.sessions.map((s) => {
      // Teacher provides times in their own timezone — convert to UTC before persisting
      const startUtc = DateTime.fromISO(s.startTime, { zone: teacher.timezone });
      const endUtc = DateTime.fromISO(s.endTime, { zone: teacher.timezone });

      if (!startUtc.isValid) {
        throw new BadRequestException(`Invalid startTime: ${s.startTime}`);
      }
      if (!endUtc.isValid) {
        throw new BadRequestException(`Invalid endTime: ${s.endTime}`);
      }
      if (endUtc <= startUtc) {
        throw new BadRequestException('endTime must be after startTime');
      }

      return this.sessionRepo.create({
        offeringId,
        teacherId: teacher.id,
        startTime: startUtc.toJSDate(),
        endTime: endUtc.toJSDate(),
      });
    });

    const saved = await this.sessionRepo.save(sessions);
    return saved;
  }

  async getMyOfferings(teacher: User) {
    const now = new Date();
    const offerings = await this.offeringRepo.find({
      where: { teacherId: teacher.id },
      order: { createdAt: 'DESC' },
    });

    // Attach sessions to each offering, only upcoming ones
    const result = await Promise.all(
      offerings.map(async (offering) => {
        const sessions = await this.sessionRepo.find({
          where: { offeringId: offering.id },
          order: { startTime: 'ASC' },
        });

        const upcoming = sessions.filter((s) => s.startTime > now);

        return {
          id: offering.id,
          courseName: offering.courseName,
          name: offering.name,
          description: offering.description,
          teacherTimezone: offering.teacherTimezone,
          createdAt: offering.createdAt,
          sessions: sessions.map((s) => this.formatSessionForTeacher(s, teacher.timezone)),
          upcomingSessionsCount: upcoming.length,
          totalSessionsCount: sessions.length,
        };
      }),
    );

    return result;
  }

  private formatSessionForTeacher(session: Session, timezone: string) {
    const start = DateTime.fromJSDate(session.startTime).setZone(timezone);
    const end = DateTime.fromJSDate(session.endTime).setZone(timezone);
    return {
      id: session.id,
      offeringId: session.offeringId,
      teacherId: session.teacherId,
      startTime: start.toISO(),
      endTime: end.toISO(),
      startTimeUtc: session.startTime.toISOString(),
      endTimeUtc: session.endTime.toISOString(),
    };
  }
}
