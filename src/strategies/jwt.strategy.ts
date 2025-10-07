import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy as PassportJwtStrategyEntity } from "passport-jwt";
import { JwtPayload } from "src/interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategyEntity, "jwt") {
	public constructor(private readonly configService: ConfigService) {
		const secret = configService?.get<string>("JWT_SECRET");
		if (!secret) {
			throw new Error("JWT_SECRET is not defined in environment variables");
		}
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret,
		});
	}

	public validate(payload: JwtPayload): JwtPayload {
		console.log("JwtStrategy, payload:", payload);
		if (!payload.userId || !payload.email) {
			throw new Error("Invalid JWT payload");
		}

		return { userId: payload.userId, email: payload.email };
	}

	public diagnostic(): void {
		console.log("JWT Strategy initialized with secret:", this.configService.get<string>("JWT_SECRET"));
	}
}
