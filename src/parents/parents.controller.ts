import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../common/entities/user.entity';
import { BookOfferingDto } from './dto/book-offering.dto';

@ApiTags('Parents')
@ApiBearerAuth()
@Controller('api/parents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARENT)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('offerings')
  @ApiOperation({ summary: 'Browse all available offerings (sessions in your local timezone)' })
  getAvailableOfferings(@CurrentUser() parent: User) {
    return this.parentsService.getAvailableOfferings(parent);
  }

  @Post('bookings')
  @ApiOperation({ summary: 'Book an offering — enforces conflict detection and concurrency safety' })
  bookOffering(@CurrentUser() parent: User, @Body() dto: BookOfferingDto) {
    return this.parentsService.bookOffering(parent, dto);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'View all my bookings with session times in my timezone' })
  getMyBookings(@CurrentUser() parent: User) {
    return this.parentsService.getMyBookings(parent);
  }
}
