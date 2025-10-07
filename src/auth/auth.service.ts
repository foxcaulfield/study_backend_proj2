import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { LoginDto } from "./dto/login.dto";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { ResponseUserDto } from "src/users/dto/response-user.dto";
import { JwtPayload } from "src/interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
	public constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	public async validateUser(email: string, password: string): Promise<JwtPayload | null> {
		console.log("AuthService, method validateUser, email:", email);
		const user = await this.usersService.findByEmail(email);
		const isValid = await this.usersService.validatePassword(user.passwordHash, password);
		if (isValid) {
			return {
				userId: user._id.toString(),
				email: user.email,
			};
		}

		// if (user && user.password === password) {
		// 	const { password, ...result } = user;
		// 	return result;
		// }

		return null;
	}

	public async logUserIn(dto: LoginDto): Promise<{ access_token: string }> {
		console.log("AuthService, method logUserIn, dto:", dto);
		const userData = await this.validateUser(dto.email, dto.password);

		if (!userData) {
			throw new UnauthorizedException("Invalid credentials");
		}
		const payload: JwtPayload = {
			email: userData.email,
			userId: userData.userId,
		};
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	public async register(dto: CreateUserDto): Promise<{ access_token: string; user: ResponseUserDto }> {
		const user = await this.usersService.createUser(dto);
		// const { passwordHash, ...result } = user;

		const payload = { email: user.email, /* sub: user._id, */ role: user.role };

		return {
			access_token: this.jwtService.sign(payload),
			user: user,
		};
	}
}
