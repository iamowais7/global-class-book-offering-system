"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const luxon_1 = require("luxon");
const offering_entity_1 = require("../common/entities/offering.entity");
const session_entity_1 = require("../common/entities/session.entity");
const booking_entity_1 = require("../common/entities/booking.entity");
const booking_status_enum_1 = require("../common/enums/booking-status.enum");
let ParentsService = class ParentsService {
    offeringRepo;
    sessionRepo;
    bookingRepo;
    dataSource;
    constructor(offeringRepo, sessionRepo, bookingRepo, dataSource) {
        this.offeringRepo = offeringRepo;
        this.sessionRepo = sessionRepo;
        this.bookingRepo = bookingRepo;
        this.dataSource = dataSource;
    }
    async getAvailableOfferings(parent) {
        const offerings = await this.offeringRepo.find({
            relations: { teacher: true },
            order: { createdAt: 'DESC' },
        });
        const result = await Promise.all(offerings.map(async (offering) => {
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
                sessions: sessions.map((s) => this.formatSessionForParent(s, parent.timezone)),
                totalSessions: sessions.length,
            };
        }));
        return result;
    }
    async bookOffering(parent, dto) {
        const { offeringId } = dto;
        return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
            await manager.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [parent.id]);
            const offering = await manager.findOne(offering_entity_1.Offering, { where: { id: offeringId } });
            if (!offering)
                throw new common_1.NotFoundException('Offering not found');
            const existingBooking = await manager.findOne(booking_entity_1.Booking, {
                where: { parentId: parent.id, offeringId, status: booking_status_enum_1.BookingStatus.CONFIRMED },
            });
            if (existingBooking)
                throw new common_1.ConflictException('You have already booked this offering');
            const newSessions = await manager
                .createQueryBuilder(session_entity_1.Session, 's')
                .where('s.offering_id = :offeringId', { offeringId })
                .setLock('pessimistic_read')
                .getMany();
            if (newSessions.length === 0) {
                throw new common_1.BadRequestException('This offering has no sessions yet and cannot be booked');
            }
            const bookedSessions = await manager
                .createQueryBuilder(session_entity_1.Session, 's')
                .innerJoin(booking_entity_1.Booking, 'b', 'b.offering_id = s.offering_id AND b.parent_id = :parentId AND b.status = :status', { parentId: parent.id, status: booking_status_enum_1.BookingStatus.CONFIRMED })
                .setLock('pessimistic_read')
                .getMany();
            for (const newSession of newSessions) {
                for (const booked of bookedSessions) {
                    const overlaps = newSession.startTime < booked.endTime && booked.startTime < newSession.endTime;
                    if (overlaps) {
                        const conflictStart = luxon_1.DateTime.fromJSDate(booked.startTime)
                            .setZone(parent.timezone)
                            .toISO();
                        const conflictEnd = luxon_1.DateTime.fromJSDate(booked.endTime)
                            .setZone(parent.timezone)
                            .toISO();
                        throw new common_1.ConflictException(`Booking conflict: a session in this offering overlaps with your existing booking on ${conflictStart} – ${conflictEnd} (${parent.timezone})`);
                    }
                }
            }
            const booking = manager.create(booking_entity_1.Booking, {
                parentId: parent.id,
                offeringId,
                status: booking_status_enum_1.BookingStatus.CONFIRMED,
            });
            const saved = await manager.save(booking_entity_1.Booking, booking);
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
    async getMyBookings(parent) {
        const bookings = await this.bookingRepo.find({
            where: { parentId: parent.id },
            relations: { offering: { teacher: true } },
            order: { createdAt: 'DESC' },
        });
        const result = await Promise.all(bookings.map(async (booking) => {
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
                sessions: sessions.map((s) => this.formatSessionForParent(s, parent.timezone)),
            };
        }));
        return result;
    }
    formatSessionForParent(session, timezone) {
        const start = luxon_1.DateTime.fromJSDate(session.startTime).setZone(timezone);
        const end = luxon_1.DateTime.fromJSDate(session.endTime).setZone(timezone);
        return {
            id: session.id,
            offeringId: session.offeringId,
            teacherId: session.teacherId,
            startTime: start.toISO(),
            endTime: end.toISO(),
            date: start.toFormat('cccc, LLLL d yyyy'),
            timeRange: `${start.toFormat('h:mm a')} – ${end.toFormat('h:mm a')} ${timezone}`,
        };
    }
};
exports.ParentsService = ParentsService;
exports.ParentsService = ParentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(offering_entity_1.Offering)),
    __param(1, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ParentsService);
//# sourceMappingURL=parents.service.js.map