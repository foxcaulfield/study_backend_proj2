import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY, ROLES_KEY } from "src/decorators/roles.decorator";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "src/interfaces/jwt-payload.interface";
import { UserRoleEnum } from "src/users/user.model";

@Injectable()
export class RolesGuard implements CanActivate {
	public constructor(
		private reflector: Reflector,
		private usersService: UsersService,
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		// Check for public access
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) return true;

		// Get required roles from metadata
		const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!requiredRoles) return true;

		// Get user from request
		const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
		const user: JwtPayload | undefined = request.user;

		if (!user || !user.userId) {
			throw new ForbiddenException("User not authenticated");
		}

		// Fetch the latest user from the database
		const dbUser = await this.usersService.findById(user.userId);
		if (!dbUser) {
			throw new ForbiddenException("User not found");
		}

		// Check roles (assuming dbUser.role is a string or array)
		const userRoles = Array.isArray(dbUser.role) ? dbUser.role : [dbUser.role];
		const hasRole = requiredRoles.some((role): boolean => userRoles.includes(role));

		if (!hasRole) {
			throw new ForbiddenException("User does not have the required role");
		}

		return true;
	}
}
