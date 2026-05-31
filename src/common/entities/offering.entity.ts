import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('offerings')
export class Offering {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The course/class name e.g. "Minecraft Coding"
  @Column({ name: 'course_name' })
  courseName: string;

  // The offering/batch name e.g. "Saturday Batch"
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  // Teacher's timezone when the offering was created (for reference)
  @Column({ name: 'teacher_timezone' })
  teacherTimezone: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
