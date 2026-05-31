import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { UserRoles } from '@RealEstate/types';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { GetPlansQueryParams } from './dto/get-plans-query-params';
import { PlanService } from './plan.service';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.SUPERADMIN)
@ApiTags('Plan')
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  /** POST /plans — superadmin only */
  @Post()
  @ResponseMessage('Plan created successfully')
  create(@Body() createPlanDto: CreatePlanDto): Promise<PlanResponseDto> {
    return this.planService.create(createPlanDto);
  }

  /** GET /plans?isActive=true|false */
  @Get()
  @ResponseMessage('Plans fetched successfully')
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: GetPlansQueryParams,
  ): Promise<PlanResponseDto[]> {
    return this.planService.findAll(query.isActive);
  }

  /** GET /plans/:id_plan — includes tenantCount */
  @Get(':id_plan')
  @ResponseMessage('Plan fetched successfully')
  findOne(@Param('id_plan') id_plan: string): Promise<PlanResponseDto> {
    return this.planService.findOne(id_plan);
  }

  /** PATCH /plans/:id_plan — superadmin only */
  @Patch(':id_plan')
  @ResponseMessage('Plan updated successfully')
  update(
    @Param('id_plan') id_plan: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ): Promise<PlanResponseDto> {
    return this.planService.update(id_plan, updatePlanDto);
  }

  /** DELETE /plans/:id_plan — soft-delete, blocked if tenants active */
  @Delete(':id_plan')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Plan deleted successfully')
  remove(@Param('id_plan') id_plan: string): Promise<PlanResponseDto> {
    return this.planService.remove(id_plan);
  }
}
