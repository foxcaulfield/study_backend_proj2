import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "src/interfaces/jwt-payload.interface";

export const CurrentUser = createParamDecorator(
	(data: keyof JwtPayload | undefined, ctx: ExecutionContext): string | JwtPayload | undefined => {
		const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
		const user = request.user;
		return data && user ? user[data] : user;
	},
);
