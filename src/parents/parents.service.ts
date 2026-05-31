import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { Offering } from '../common/entities/offering.entity';
import { Session } from '../common/entities/session.entity';
import { Booking } from '../common/entities/booking.entity';
import { User } from '../common/entities/user.entity';
import { BookOfferingDto } from './dto/book-offering.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Offering)
    private readonly offeringRepo: Repository<Offering>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  async getAvailableOfferings(parent: User) {
    const offerings = await this.offeringRepo.find({
      relations: { teacher: true },
      order: { createdAt: 'DESC' },
    });

    const result = await Promise.all(
      offerings.map(async (offering) => {
        const sessions = await this.sessionRepo.find({
          where: { offeringId: offering.id },
          order: { startTime: 'ASC' },
        });

        return {
          id: offering.id,
          courseName: offering.courseName,
          name: offering.name,
          description: offering.description,
          teacher: {
            id: offering.teacher.id,
            name: offering.teacher.name,
            timezone: offering.teacher.timezone,
          },
          // Sessions shown in parent's local timezone
          sessions: sessions.map((s) => this.formatSessionForParent(s, parent.timezone)),
          totalSessions: sessions.length,
        };
      }),
    );

    return result;
  }

  async bookOffering(parent: User, dto: BookOfferingDto) {
    const { offeringId } = dto;

    // Run everything inside a serializable transaction with advisory lock
    // to prevent concurrent duplicate bookings for the same parent
    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      // Advisory lock per parent — prevents race condition where the same parent
      // submits two simultaneous booking requests that both pass conflict check
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtext($1))`,
        [parent.id],
      );

      // Verify offering exists
      const offering = await manager.findOne(Offering, { where: { id: offeringId } });
      if (!offering) throw new NotFoundException('Offering not found');

      // Check if parent already booked this offering
      const existingBooking = await manager.findOne(Booking, {
        where: { parentId: parent.id, offeringId, status: BookingStatus.CONFIRMED },
      });
      if (existingBooking) throw new ConflictException('You have already booked this offering');

      // Get sessions of the offering the parent wants to book
      const newSessions = await manager
        .createQueryBuilder(Session, 's')
        .where('s.offering_id = :offeringId', { offeringId })
        .setLock('pessimistic_read')
        .getMany();

      if (newSessions.length === 0) {
        throw new BadRequestException('This offering has no sessions yet and cannot be booked');
      }

      // Get all sessions the parent has already booked (from confirmed bookings)
      // Using a JOIN for efficiency — lock booked offering sessions to prevent concurrent modifications
      const bookedSessions = await manager
        .createQueryBuilder(Session, 's')
        .innerJoin(
          Booking,
          'b',
          'b.offering_id = s.offering_id AND b.parent_id = :parentId AND b.status = :status',
          { parentId: parent.id, status: BookingStatus.CONFIRMED },
        )
        .setLock('pessimistic_read')
        .getMany();

      // Rule 2: Time conflict check — new sessions must not overlap any already-booked session
      // Two intervals [s1, e1) and [s2, e2) overlap when s1 < e2 AND s2 < e1
      for (const newSession of newSessions) {
        for (const booked of bookedSessions) {
          const overlaps =
            newSession.startTime < booked.endTime && booked.startTime < newSession.endTime;
          if (overlaps) {
            const conflictStart = DateTime.fromJSDate(booked.startTime)
              .setZone(parent.timezone)
              .toISO();
            const conflictEnd = DateTime.fromJSDate(booked.endTime)
              .setZone(parent.timezone)
              .toISO();
            throw new ConflictException(
              `Booking conflict: a session in this offering overlaps with your existing booking on ${conflictStart} – ${conflictEnd} (${parent.timezone})`,
            );
          }
        }
      }

      // Create the booking
      const booking = manager.create(Booking, {
        parentId: parent.id,
        offeringId,
        status: BookingStatus.CONFIRMED,
      });
      const saved = await manager.save(Booking, booking);

      return {
        id: saved.id,
        offeringId: saved.offeringId,
        parentId: saved.parentId,
        status: saved.status,
        createdAt: saved.createdAt,
        offering: {
          id: offering.id,
          courseName: offering.courseName,
          name: offering.name,
        },
        sessions: newSessions.map((s) => this.formatSessionForParent(s, parent.timezone)),
      };
    });
  }

  async getMyBookings(parent: User) {
    const bookings = await this.bookingRepo.find({
      where: { parentId: parent.id },
      relations: { offering: { teacher: true } },
      order: { createdAt: 'DESC' },
    });

    const result = await Promise.all(
      bookings.map(async (booking) => {
        const sessions = await this.sessionRepo.find({
          where: { offeringId: booking.offeringId },
          order: { startTime: 'ASC' },
        });

        return {
          id: booking.id,
          status: booking.status,
          bookedAt: booking.createdAt,
          offering: {
            id: booking.offering.id,
            courseName: booking.offering.courseName,
            name: booking.offering.name,
            description: booking.offering.description,
            teacher: {
              id: booking.offering.teacher.id,
              name: booking.offering.teacher.name,
            },
          },
          // All session times shown in parent's local timezone
          sessions: sessions.map((s) => this.formatSessionForParent(s, parent.timezone)),
        };
      }),
    );

    return result;
  }

  private formatSessionForParent(session: Session, timezone: string) {
    const start = DateTime.fromJSDate(session.startTime).setZone(timezone);
    const end = DateTime.fromJSDate(session.endTime).setZone(timezone);
    return {
      id: session.id,
      offeringId: session.offeringId,
      teacherId: session.teacherId,
      startTime: start.toISO(),
      endTime: end.toISO(),
      // Convenience fields for the parent
      date: start.toFormat('cccc, LLLL d yyyy'),
      timeRange: `${start.toFormat('h:mm a')} – ${end.toFormat('h:mm a')} ${timezone}`,
    };
  }
}
