export interface JwtPayload {
  sub: string;
  email: string;
  role: string; // UserRoles type, but keep as string since it comes from JWT
  tenantId: string | null;
}
