import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offering } from '../common/entities/offering.entity';
import { Session } from '../common/entities/session.entity';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Offering, Session])],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
