import { PlanPeriod } from '@RealEstate/types';

export class PlanResponseDto {
  id_plan!: string;
  name!: string;
  price!: number;
  pricePeriod!: PlanPeriod;
  isActive!: boolean;
}
