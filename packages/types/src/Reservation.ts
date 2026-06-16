export const ReservationStatus = {
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const Platform = {
  BOOKING: 'BOOKING',
  AIRBNB: 'AIRBNB',
  OTHER: 'OTHER',
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];

export class CreateReservationDto {
  guestName!: string;
  numberOfGuests!: number;
  startDate!: Date;
  endDate!: Date;
  totalCost!: number;
  platform!: Platform;
}

export class UpdateReservationDto {
  guestName?: string;
  numberOfGuests?: number;
  startDate?: Date;
  endDate?: Date;
  totalCost?: number;
  platform?: Platform;
}

export class UpdateReservationStatusDto {
  status!: ReservationStatus;
}

export class Reservation {
  id_reservation!: string;
  id_property!: string;
  guestName!: string;
  numberOfGuests!: number;
  startDate!: Date;
  endDate!: Date;
  totalCost!: number;
  platform!: Platform;
  status!: ReservationStatus;
  dateCancelled?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
