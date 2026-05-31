import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Only forward transitions are allowed via this endpoint.
 *  UPCOMING → ACTIVE → COMPLETED
 *  Use PATCH /reservations/:id/cancel for cancellation.
 */
export enum ForwardReservationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export class UpdateReservationStatusDto {
  @ApiProperty({ enum: ForwardReservationStatus })
  @IsEnum(ForwardReservationStatus)
  status!: ForwardReservationStatus;
}
