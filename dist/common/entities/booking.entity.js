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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const offering_entity_1 = require("./offering.entity");
const booking_status_enum_1 = require("../enums/booking-status.enum");
let Booking = class Booking {
    id;
    parentId;
    parent;
    offeringId;
    offering;
    status;
    createdAt;
};
exports.Booking = Booking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Booking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_id' }),
    __metadata("design:type", String)
], Booking.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'parent_id' }),
    __metadata("design:type", user_entity_1.User)
], Booking.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'offering_id' }),
    __metadata("design:type", String)
], Booking.prototype, "offeringId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => offering_entity_1.Offering),
    (0, typeorm_1.JoinColumn)({ name: 'offering_id' }),
    __metadata("design:type", offering_entity_1.Offering)
], Booking.prototype, "offering", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: booking_status_enum_1.BookingStatus, default: booking_status_enum_1.BookingStatus.CONFIRMED }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Booking.prototype, "createdAt", void 0);
exports.Booking = Booking = __decorate([
    (0, typeorm_1.Unique)(['parentId', 'offeringId']),
    (0, typeorm_1.Entity)('bookings')
], Booking);
//# sourceMappingURL=booking.entity.js.map