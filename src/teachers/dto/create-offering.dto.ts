import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOfferingDto {
  @ApiProperty({ example: 'Minecraft Coding', description: 'Course/class name' })
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @ApiProperty({ example: 'Saturday Batch', description: 'Offering/batch name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '8-week beginner coding course' })
  @IsString()
  @IsOptional()
  description?: string;
}
