import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offering } from '../common/entities/offering.entity';
import { Session } from '../common/entities/session.entity';
import { Booking } from '../common/entities/booking.entity';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Offering, Session, Booking])],
  controllers: [ParentsController],
  providers: [ParentsService],
})
export class ParentsModule {}
