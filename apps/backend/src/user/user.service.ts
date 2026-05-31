import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRoles } from '@RealEstate/types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { ClientService } from '../client/client.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserResponseDto, PrivateUserResponseDto } from './dto/user-response.dto';
import { type TenantScope, assertTenantMatch, resolveTenantId } from '../common/types/tenant-scope';

@Injectable()
export class UserService {
  private readonly saltOrRounds: number;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly clientService: ClientService,
  ) {
    const raw = this.configService.get<string>('BCRYPT_SALT_ROUNDS') || '10';
    const rounds = Number(raw);
    if (isNaN(rounds) || rounds < 4 || rounds > 15) {
      throw new Error(
        `Invalid BCRYPT_SALT_ROUNDS value: ${raw}. It must be a positive integer between 4 and 15.`,
      );
    }
    this.saltOrRounds = rounds;
  }

  async createUser(input: CreateUserDto, scope: TenantScope): Promise<UserResponseDto> {
    const isUserExists = await this.userRepository.existsByEmail(input.email);
    if (isUserExists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashPassword(input.password);
    const { email, firstName, lastName, role } = input;
    const id_tenant = resolveTenantId(scope, input.id_tenant);

    const user = await this.userRepository.create({
      email,
      firstName,
      lastName,
      role,
      passwordHash: hashedPassword,
      tenant: id_tenant ? { connect: { id_tenant } } : undefined,
    });

    // Auto-create a linked Client record for users with CLIENT role
    if (user.role === UserRoles.CLIENT) {
      await this.clientService.create({
        firstName: firstName ?? email.split('@')[0],
        lastName,
        id_user: user.id_user,
        id_tenant: id_tenant ?? undefined,
      });
    }

    return user;
  }

  async findAll(page = 1, limit = 20, scope: TenantScope) {
    return this.userRepository.findWithPagination(page, limit, scope);
  }

  async findOne(id_user: string, scope?: TenantScope): Promise<UserResponseDto> {
    const foundUser = await this.userRepository.findById(id_user);
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    if (scope) assertTenantMatch(scope, foundUser.id_tenant);
    return foundUser;
  }

  async findByEmail(
    email: string,
    includePrivate: boolean = false,
  ): Promise<PrivateUserResponseDto> {
    const foundUser = await this.userRepository.findByEmail(email, includePrivate);
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    return foundUser as PrivateUserResponseDto;
  }

  async update(id_user: string, input: UpdateUserDto, scope?: TenantScope): Promise<UserResponseDto> {
    if (
      input.email === undefined &&
      input.firstName === undefined &&
      input.lastName === undefined &&
      input.role === undefined &&
      input.id_tenant === undefined
    ) {
      throw new BadRequestException('No fields to update');
    }

    if (input.email) {
      const emailExists = await this.userRepository.existsByEmail(input.email);
      if (emailExists) {
        throw new ConflictException(`User email '${input.email}' already exists`);
      }
    }

    const user = await this.userRepository.findById(id_user);
    if (!user) throw new NotFoundException('User not found');
    if (scope) assertTenantMatch(scope, user.id_tenant);

    // Tenant-scoped callers cannot reassign a user to a different tenant.
    // Strip `id_tenant` via destructuring instead of mutating `input`.
    const updateInput =
      scope?.type === 'TENANT'
        ? (({ id_tenant: _ignored, ...rest }) => rest)(input)
        : input;

    return await this.userRepository.update(id_user, updateInput);
  }

  async remove(id_user: string, scope?: TenantScope): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id_user);
    if (!user) throw new NotFoundException('User not found');
    if (scope) assertTenantMatch(scope, user.id_tenant);
    return await this.userRepository.softDelete(id_user);
  }

  async findAgentPayments(id_user: string, scope?: TenantScope) {
    const user = await this.userRepository.findById(id_user);
    if (!user) throw new NotFoundException('User not found');
    if (scope) assertTenantMatch(scope, user.id_tenant);
    return this.userRepository.findAgentPayments(id_user);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltOrRounds);
  }

  async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
