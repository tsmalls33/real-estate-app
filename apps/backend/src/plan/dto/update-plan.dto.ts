import { PartialType } from '@nestjs/mapped-types';
import { UpdatePlanDto as SharedUpdatePlanDto } from '@RealEstate/types';
import { CreatePlanDto } from './create-plan.dto';

export class UpdatePlanDto extends PartialType(CreatePlanDto) implements SharedUpdatePlanDto {}
