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
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const luxon_1 = require("luxon");
const offering_entity_1 = require("../common/entities/offering.entity");
const session_entity_1 = require("../common/entities/session.entity");
let TeachersService = class TeachersService {
    offeringRepo;
    sessionRepo;
    constructor(offeringRepo, sessionRepo) {
        this.offeringRepo = offeringRepo;
        this.sessionRepo = sessionRepo;
    }
    async createOffering(teacher, dto) {
        const offering = this.offeringRepo.create({
            courseName: dto.courseName,
            name: dto.name,
            description: dto.description,
            teacherId: teacher.id,
            teacherTimezone: teacher.timezone,
        });
        return this.offeringRepo.save(offering);
    }
    async addSessions(teacher, offeringId, dto) {
        const offering = await this.offeringRepo.findOne({ where: { id: offeringId } });
        if (!offering)
            throw new common_1.NotFoundException('Offering not found');
        if (offering.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('You do not own this offering');
        }
        const sessions = dto.sessions.map((s) => {
            const startUtc = luxon_1.DateTime.fromISO(s.startTime, { zone: teacher.timezone });
            const endUtc = luxon_1.DateTime.fromISO(s.endTime, { zone: teacher.timezone });
            if (!startUtc.isValid) {
                throw new common_1.BadRequestException(`Invalid startTime: ${s.startTime}`);
            }
            if (!endUtc.isValid) {
                throw new common_1.BadRequestException(`Invalid endTime: ${s.endTime}`);
            }
            if (endUtc <= startUtc) {
                throw new common_1.BadRequestException('endTime must be after startTime');
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
    async getMyOfferings(teacher) {
        const now = new Date();
        const offerings = await this.offeringRepo.find({
            where: { teacherId: teacher.id },
            order: { createdAt: 'DESC' },
        });
        const result = await Promise.all(offerings.map(async (offering) => {
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
        }));
        return result;
    }
    formatSessionForTeacher(session, timezone) {
        const start = luxon_1.DateTime.fromJSDate(session.startTime).setZone(timezone);
        const end = luxon_1.DateTime.fromJSDate(session.endTime).setZone(timezone);
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
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(offering_entity_1.Offering)),
    __param(1, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map