import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantThemeDto } from './dto/update-tenant-theme.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { TenantRepository } from './tenant.repository';
import { ThemeService } from '../theme/theme.service';

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly themeService: ThemeService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    const isTenantExists = await this.tenantRepository.existsByName(
      createTenantDto.name,
    );

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

  async findOne(
    id_tenant: string,
    includeUsers: boolean = false,
  ): Promise<TenantResponseDto> {
    const foundTenant = await this.tenantRepository.findById(
      id_tenant,
      includeUsers,
    );

    if (!foundTenant)
      throw new NotFoundException(`Tenant with id '${id_tenant}' not found`); // returns 404 Not Found

    return foundTenant as TenantResponseDto;
  }

  async update(
    id_tenant: string,
    input: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    // check if at least one field is provided for update
    if (!input.name && !input.customDomain && !input.id_plan) {
      throw new BadRequestException('No fields to update');
    }

    // check if tenant name is being updated and if it already exists
    if (input.name) {
      const isTenantExists = await this.tenantRepository.existsByName(
        input.name,
      );

      if (isTenantExists) {
        throw new ConflictException(
          `Tenant name '${input.name}' already exists`,
        );
      }
    }

    // check if tenant exists
    const tenantExists = await this.tenantRepository.existsById(id_tenant);

    if (!tenantExists)
      throw new NotFoundException(`Tenant with id '${id_tenant}' not found`); // returns 404 Not Found

    return this.tenantRepository.update(
      id_tenant,
      input,
    ) as Promise<TenantResponseDto>;
  }

  async remove(id_tenant: string): Promise<TenantResponseDto> {
    // check if tenant exists
    const tenantExists = await this.tenantRepository.existsById(id_tenant);

    if (!tenantExists)
      throw new NotFoundException(`Tenant with '${id_tenant}' not found`); // returns 404 Not Found

    return this.tenantRepository.softDelete(
      id_tenant,
    ) as Promise<TenantResponseDto>;
  }

  async updateTheme(
    id_tenant: string,
    input: UpdateTenantThemeDto,
  ): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(id_tenant);
    if (!tenant)
      throw new NotFoundException(`Tenant with id '${id_tenant}' not found`);

    const hasFieldOverrides =
      input.name !== undefined ||
      input.backgroundColor !== undefined ||
      input.brandColor !== undefined ||
      input.secondaryColor !== undefined ||
      input.logoIcon !== undefined ||
      input.logoBanner !== undefined;

    if (input.id_theme) {
      // Reassignment and per-field edits are mutually exclusive: a request
      // carrying both would silently drop the overrides on the early return.
      if (hasFieldOverrides) {
        throw new BadRequestException(
          'Provide either id_theme (to reassign) or theme fields (to edit), not both',
        );
      }
      await this.themeService.findOne(input.id_theme);
      try {
        return (await this.tenantRepository.assignTheme(
          id_tenant,
          input.id_theme,
        )) as TenantResponseDto;
      } catch (error) {
        // Unique constraint on Tenant.id_theme: a theme belongs to one tenant.
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            `Theme '${input.id_theme}' is already assigned to another tenant`,
          );
        }
        throw error;
      }
    }

    if (!hasFieldOverrides) {
      throw new BadRequestException('No theme fields to update');
    }

    if (tenant.id_theme) {
      await this.themeService.update(tenant.id_theme, input);
      return this.tenantRepository.findById(
        id_tenant,
      ) as Promise<TenantResponseDto>;
    }

    if (!input.backgroundColor || !input.brandColor || !input.secondaryColor) {
      throw new BadRequestException(
        'backgroundColor, brandColor, and secondaryColor are required when creating a tenant theme',
      );
    }

    const created = await this.themeService.create({
      name: input.name ?? `${tenant.name} theme`,
      backgroundColor: input.backgroundColor,
      brandColor: input.brandColor,
      secondaryColor: input.secondaryColor,
      logoIcon: input.logoIcon ?? null,
      logoBanner: input.logoBanner ?? null,
    });
    return this.tenantRepository.assignTheme(
      id_tenant,
      created.id_theme,
    ) as Promise<TenantResponseDto>;
  }
}
