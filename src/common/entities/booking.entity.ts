import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Offering } from './offering.entity';
import { BookingStatus } from '../enums/booking-status.enum';

// A parent can only book the same offering once
@Unique(['parentId', 'offeringId'])
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_id' })
  parentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @Column({ name: 'offering_id' })
  offeringId: string;

  @ManyToOne(() => Offering)
  @JoinColumn({ name: 'offering_id' })
  offering: Offering;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
