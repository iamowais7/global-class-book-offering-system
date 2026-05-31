import { IsUUID } from 'class-validator';

export class BookOfferingDto {
  @IsUUID()
  offeringId: string;
}
