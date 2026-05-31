import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BookOfferingDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'UUID of the offering to book' })
  @IsUUID()
  offeringId: string;
}
