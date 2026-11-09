import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../../../generated/prisma/client";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()]
    );

    if (!required || required.length === 0) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();

    if (!req.user) {
      throw new UnauthorizedException();
    }

    if (!required.includes(req.user.role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}




