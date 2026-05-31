import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../common/entities/user.entity';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { AddSessionsDto } from './dto/add-sessions.dto';

@Controller('api/teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // POST /api/teachers/offerings
  @Post('offerings')
  createOffering(@CurrentUser() teacher: User, @Body() dto: CreateOfferingDto) {
    return this.teachersService.createOffering(teacher, dto);
  }

  // POST /api/teachers/offerings/:id/sessions
  @Post('offerings/:id/sessions')
  addSessions(
    @CurrentUser() teacher: User,
    @Param('id', ParseUUIDPipe) offeringId: string,
    @Body() dto: AddSessionsDto,
  ) {
    return this.teachersService.addSessions(teacher, offeringId, dto);
  }

  // GET /api/teachers/offerings
  @Get('offerings')
  getMyOfferings(@CurrentUser() teacher: User) {
    return this.teachersService.getMyOfferings(teacher);
  }
}
