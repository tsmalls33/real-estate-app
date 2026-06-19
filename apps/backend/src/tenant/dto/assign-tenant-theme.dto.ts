import { IsUUID } from 'class-validator';

export class AssignTenantThemeDto {
  @IsUUID()
  id_theme!: string;
}
