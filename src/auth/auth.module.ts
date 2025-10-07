import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { LocalStrategy } from "src/strategies/local.strategy";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "src/strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (): JwtModuleOptions => {
				return {
					secret: process.env.JWT_SECRET,
					signOptions: {
						expiresIn: "60m",
					},
				};
			},
		}),
		ConfigModule,
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
