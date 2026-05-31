import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class SessionItemDto {
  @ApiProperty({ example: '2026-06-07T18:00:00', description: 'Session start time in teacher\'s local timezone' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2026-06-07T19:00:00', description: 'Session end time in teacher\'s local timezone' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}

export class AddSessionsDto {
  @ApiProperty({ type: [SessionItemDto], description: 'List of sessions to add' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SessionItemDto)
  sessions: SessionItemDto[];
}
