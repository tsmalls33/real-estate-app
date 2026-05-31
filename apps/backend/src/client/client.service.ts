import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ClientRepository } from './client.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { GetClientsQueryParams } from './dto/get-clients-query-params';
import { type TenantScope, assertTenantMatch, resolveTenantId } from '../common/types/tenant-scope';

@Injectable()
export class ClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async create(dto: CreateClientDto, scope?: TenantScope) {
    if (scope) {
      const id_tenant = resolveTenantId(scope, dto.id_tenant);
      if (!id_tenant) throw new BadRequestException('id_tenant is required');
      return this.clientRepository.create({
        ...(dto as Prisma.ClientUncheckedCreateInput),
        id_tenant,
      });
    }
    return this.clientRepository.create(
      dto as Prisma.ClientUncheckedCreateInput,
    );
  }

  async findAll(query: GetClientsQueryParams, scope: TenantScope) {
    return this.clientRepository.findAll({
      search: query.search,
      scope,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  async findOne(id_client: string, scope?: TenantScope) {
    const client = await this.clientRepository.findById(id_client);
    if (!client) throw new NotFoundException(`Client '${id_client}' not found`);

    if (scope) assertTenantMatch(scope, client.id_tenant);

    return client;
  }

  async update(id_client: string, dto: UpdateClientDto, scope?: TenantScope) {
    const client = await this.clientRepository.findById(id_client);
    if (!client) throw new NotFoundException(`Client '${id_client}' not found`);

    if (scope) assertTenantMatch(scope, client.id_tenant);

    return this.clientRepository.update(
      id_client,
      dto as Prisma.ClientUncheckedUpdateInput,
    );
  }

  async remove(id_client: string, scope?: TenantScope) {
    const client = await this.clientRepository.findById(id_client);
    if (!client) throw new NotFoundException(`Client '${id_client}' not found`);

    if (scope) assertTenantMatch(scope, client.id_tenant);

    return this.clientRepository.softDelete(id_client);
  }
}
