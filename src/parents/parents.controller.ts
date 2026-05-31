import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../common/entities/user.entity';
import { BookOfferingDto } from './dto/book-offering.dto';

@Controller('api/parents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARENT)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  // GET /api/parents/offerings
  @Get('offerings')
  getAvailableOfferings(@CurrentUser() parent: User) {
    return this.parentsService.getAvailableOfferings(parent);
  }

  // POST /api/parents/bookings
  @Post('bookings')
  bookOffering(@CurrentUser() parent: User, @Body() dto: BookOfferingDto) {
    return this.parentsService.bookOffering(parent, dto);
  }

  // GET /api/parents/bookings
  @Get('bookings')
  getMyBookings(@CurrentUser() parent: User) {
    return this.parentsService.getMyBookings(parent);
  }
}
