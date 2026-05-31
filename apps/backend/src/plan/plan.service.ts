import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { PlanRepository } from './plan.repository';

@Injectable()
export class PlanService {
  constructor(private readonly planRepository: PlanRepository) {}

  async create(createPlanDto: CreatePlanDto): Promise<PlanResponseDto> {
    const exists = await this.planRepository.existsByName(createPlanDto.name);
    if (exists)
      throw new ConflictException(
        `Plan with name '${createPlanDto.name}' already exists`,
      );

    return this.planRepository.create({
      name: createPlanDto.name,
      price: createPlanDto.price,
      pricePeriod: createPlanDto.pricePeriod,
      isActive: createPlanDto.isActive ?? true,
    }) as unknown as Promise<PlanResponseDto>;
  }

  async findAll(isActive?: boolean): Promise<PlanResponseDto[]> {
    return this.planRepository.findAll(isActive) as unknown as Promise<PlanResponseDto[]>;
  }

  async findOne(id_plan: string): Promise<PlanResponseDto> {
    const plan = await this.planRepository.findById(id_plan);
    if (!plan)
      throw new NotFoundException(`Plan with id '${id_plan}' not found`);
    return plan as unknown as PlanResponseDto;
  }

  async update(
    id_plan: string,
    updatePlanDto: UpdatePlanDto,
  ): Promise<PlanResponseDto> {
    if (
      !updatePlanDto.name &&
      updatePlanDto.isActive === undefined &&
      updatePlanDto.price === undefined &&
      !updatePlanDto.pricePeriod
    )
      throw new BadRequestException('No fields to update');

    if (updatePlanDto.name) {
      const nameExists = await this.planRepository.existsByName(
        updatePlanDto.name,
      );
      if (nameExists)
        throw new ConflictException(
          `Plan name '${updatePlanDto.name}' already exists`,
        );
    }

    const planExists = await this.planRepository.existsById(id_plan);
    if (!planExists)
      throw new NotFoundException(`Plan with id '${id_plan}' not found`);

    return this.planRepository.update(
      id_plan,
      updatePlanDto,
    ) as unknown as Promise<PlanResponseDto>;
  }

  async remove(id_plan: string): Promise<PlanResponseDto> {
    const planExists = await this.planRepository.existsById(id_plan);
    if (!planExists)
      throw new NotFoundException(`Plan with id '${id_plan}' not found`);

    const tenantCount = await this.planRepository.countTenants(id_plan);
    if (tenantCount > 0)
      throw new ConflictException(
        `Cannot delete plan: ${tenantCount} tenant(s) are currently using it`,
      );

    return this.planRepository.softDelete(id_plan) as unknown as Promise<PlanResponseDto>;
  }
}
