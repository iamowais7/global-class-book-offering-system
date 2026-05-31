import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../common/entities/user.entity';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { AddSessionsDto } from './dto/add-sessions.dto';

@ApiTags('Teachers')
@ApiBearerAuth()
@Controller('api/teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('offerings')
  @ApiOperation({ summary: 'Create a new offering/batch for a course' })
  createOffering(@CurrentUser() teacher: User, @Body() dto: CreateOfferingDto) {
    return this.teachersService.createOffering(teacher, dto);
  }

  @Post('offerings/:id/sessions')
  @ApiOperation({ summary: 'Add sessions to an offering (times in teacher\'s timezone)' })
  addSessions(
    @CurrentUser() teacher: User,
    @Param('id', ParseUUIDPipe) offeringId: string,
    @Body() dto: AddSessionsDto,
  ) {
    return this.teachersService.addSessions(teacher, offeringId, dto);
  }

  @Get('offerings')
  @ApiOperation({ summary: 'Get all my offerings with sessions (upcoming count included)' })
  getMyOfferings(@CurrentUser() teacher: User) {
    return this.teachersService.getMyOfferings(teacher);
  }
}
