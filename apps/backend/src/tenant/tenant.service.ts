import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { TenantRepository } from './tenant.repository';
import { ThemeService } from '../theme/theme.service';


@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly themeService: ThemeService,
  ) { }

  async create(createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    const isTenantExists = await this.tenantRepository.existsByName(createTenantDto.name);

    if (isTenantExists) throw new ConflictException('Tenant already exists'); // returns 409 Conflict

    const dbTenant = {
      name: createTenantDto.name,
      customDomain: createTenantDto.customDomain,
      id_plan: createTenantDto.id_plan,
    };

    return this.tenantRepository.create(dbTenant) as Promise<TenantResponseDto>;
  }

  async findAll(): Promise<TenantResponseDto[]> {
    return this.tenantRepository.findAll() as Promise<TenantResponseDto[]>;
  }

  async findOne(id_tenant: string, includeUsers: boolean = false): Promise<TenantResponseDto> {
    const foundTenant = await this.tenantRepository.findById(id_tenant, includeUsers);

    if (!foundTenant)
      throw new NotFoundException(`Tenant with id '${id_tenant}' not found`); // returns 404 Not Found

    return foundTenant as TenantResponseDto;
  }

  async update(id_tenant: string, input: UpdateTenantDto): Promise<TenantResponseDto> {
    // check if at least one field is provided for update
    if (
      !input.name &&
      !input.customDomain &&
      !input.id_plan
    ) {
      throw new BadRequestException('No fields to update');
    }

    // check if tenant name is being updated and if it already exists
    if (input.name) {
      const isTenantExists = await this.tenantRepository.existsByName(input.name);

      if (isTenantExists) {
        throw new ConflictException(`Tenant name '${input.name}' already exists`);
      }
    }

    // check if tenant exists
    const tenantExists = await this.tenantRepository.existsById(id_tenant);

    if (!tenantExists)
      throw new NotFoundException(`Tenant with id '${id_tenant}' not found`); // returns 404 Not Found

    return this.tenantRepository.update(id_tenant, input) as Promise<TenantResponseDto>;
  }

  async remove(id_tenant: string): Promise<TenantResponseDto> {
    // check if tenant exists
    const tenantExists = await this.tenantRepository.existsById(id_tenant);

    if (!tenantExists)
      throw new NotFoundException(`Tenant with '${id_tenant}' not found`); // returns 404 Not Found

    return this.tenantRepository.softDelete(id_tenant) as Promise<TenantResponseDto>;
  }

  async updateTheme(id_tenant: string, id_theme: string): Promise<TenantResponseDto> {
    // validate theme exists before assigning
    await this.themeService.findOne(id_theme);

    // check if tenant exists
    const tenantExists = await this.tenantRepository.existsById(id_tenant);
    if (!tenantExists)
      throw new NotFoundException(`Tenant with id '${id_tenant}' not found`); // returns 404 Not Found

    return this.tenantRepository.assignTheme(id_tenant, id_theme) as Promise<TenantResponseDto>;
  }
}
