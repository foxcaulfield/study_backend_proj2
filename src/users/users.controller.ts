import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { ResponseUserDto } from "./dto/response-user.dto";
import { UserRoleEnum } from "./user.model";
import { CurrentUser } from "src/decorators/current-user.decorator";
import { CurrentUserPipe } from "src/pipes/current-user.pipe";
import { Roles } from "src/decorators/roles.decorator";
import { RolesGuard } from "src/guards/roles.guard";

export interface User {
	_id?: { toString(): string };
	id?: string;
	email: string;
	fullname?: string;
	phone?: string;
	role?: UserRoleEnum;
}

@Controller("users")
export class UsersController {
	public constructor(private readonly usersService: UsersService) {}

	@UseGuards(JwtAuthGuard)
	@Get("profile")
	public getProfile(@CurrentUser(undefined, CurrentUserPipe) user: ResponseUserDto): ResponseUserDto {
		return {
			id: user.id,
			email: user.email,
			role: user.role,
			fullname: user?.fullname || "FULLNAME NOT PROVIDED",
			phone: user?.phone || "PHONE NOT FOUND",
		};
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRoleEnum.ADMIN)
	@Get(":id")
	public async findOne(@Param("id") id: string): Promise<ResponseUserDto> {
		const user = await this.usersService.findById(id);

		return {
			id: user.id,
			email: user.email,
			fullname: user.fullname,
			phone: user.phone,
			role: user.role,
		};
	}
}
