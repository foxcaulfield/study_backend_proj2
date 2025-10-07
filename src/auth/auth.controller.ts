import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "src/guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { ResponseUserDto } from "src/users/dto/response-user.dto";

@Controller("auth")
export class AuthController {
	public constructor(private readonly authService: AuthService) {}

	@UseGuards(LocalAuthGuard)
	@Post("login")
	public async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
		console.log("AuthController, method 'login', loginDto:", loginDto);
		return this.authService.logUserIn(loginDto);
	}

	@Post("register")
	public async register(@Body() createUserDto: CreateUserDto): Promise<{
		access_token: string;
		user: ResponseUserDto;
	}> {
		return this.authService.register(createUserDto);
	}
}
