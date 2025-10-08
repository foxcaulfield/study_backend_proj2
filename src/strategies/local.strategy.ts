import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as PassportLocalStrategyEntity } from "passport-local";
import { AuthService } from "src/auth/auth.service";
import { JwtPayload } from "src/interfaces/jwt-payload.interface";

@Injectable()
export class LocalStrategy extends PassportStrategy(PassportLocalStrategyEntity, "local") {
	public constructor(private readonly authService: AuthService) {
		super({
			usernameField: "email",
			passwordField: "password",
		});
	}

	public async validate(email: string, password: string): Promise<JwtPayload> {
		const user = await this.authService.validateUser(email, password);

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}
}
