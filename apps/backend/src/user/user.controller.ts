import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryParams } from './dto/get-users-query-params';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { TenantScope } from '../common/types/tenant-scope';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRoles } from '@RealEstate/types';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ResponseMessage('User created successfully')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  create(@Body() input: CreateUserDto, @CurrentTenant() scope: TenantScope) {
    return this.userService.createUser(input, scope);
  }

  @Get()
  @ResponseMessage('Users fetched successfully')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.EMPLOYEE)
  findAll(@Query() query: GetUsersQueryParams, @CurrentTenant() scope: TenantScope) {
    return this.userService.findAll(query.page, query.limit, scope);
  }

  /** GET /user/me — must come before GET /user/:id_user */
  @Get('me')
  @ResponseMessage('Profile fetched successfully')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: JwtPayload) {
    return this.userService.findOne(user.sub);
  }

  @Get(':id_user')
  @ResponseMessage('User fetched successfully')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN, UserRoles.EMPLOYEE)
  findOne(@Param('id_user') id_user: string, @CurrentTenant() scope: TenantScope) {
    return this.userService.findOne(id_user, scope);
  }

  @Get(':id_user/agent-payments')
  @ResponseMessage('Agent payments fetched successfully')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.SUPERADMIN)
  findAgentPayments(@Param('id_user') id_user: string, @CurrentTenant() scope: TenantScope) {
    return this.userService.findAgentPayments(id_user, scope);
  }

  @Patch(':id_user')
  @ResponseMessage('User updated successfully')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  update(@Param('id_user') id_user: string, @Body() input: UpdateUserDto, @CurrentTenant() scope: TenantScope) {
    return this.userService.update(id_user, input, scope);
  }

  @Delete(':id_user')
  @ResponseMessage('User deleted successfully')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  remove(@Param('id_user') id_user: string, @CurrentTenant() scope: TenantScope) {
    return this.userService.remove(id_user, scope);
  }
}
