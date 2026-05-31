import { GetTenantQueryParams as SharedGetTenantQueryParams } from "@RealEstate/types";
import { IsBoolean, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class GetTenantQueryParams implements SharedGetTenantQueryParams {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value; // keep original so validator can fail
  })
  @IsBoolean()
  includeUsers?: boolean;
}
