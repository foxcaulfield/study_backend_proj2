import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "src/interfaces/jwt-payload.interface";

export const CurrentUser = createParamDecorator(
	(data: keyof JwtPayload | undefined, ctx: ExecutionContext): string | JwtPayload | undefined => {
		console.log("CurrentUser decorator data:", data);
		const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
		console.log("CurrentUser decorator request.user:", request.user);
		const user = request.user;
		return data && user ? user[data] : user;
	},
);
