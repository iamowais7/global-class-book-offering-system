import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOfferingDto {
  // Course/class name e.g. "Minecraft Coding"
  @IsString()
  @IsNotEmpty()
  courseName: string;

  // Offering/batch name e.g. "Saturday Batch"
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
