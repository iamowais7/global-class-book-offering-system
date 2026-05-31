import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class SessionItemDto {
  // ISO 8601 datetime in the teacher's local timezone e.g. "2025-06-07T18:00:00"
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  // ISO 8601 datetime in the teacher's local timezone e.g. "2025-06-07T19:00:00"
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}

export class AddSessionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SessionItemDto)
  sessions: SessionItemDto[];
}
