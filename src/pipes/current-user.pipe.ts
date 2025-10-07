import { Injectable, PipeTransform, ArgumentMetadata, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "src/interfaces/jwt-payload.interface";
import { ResponseUserDto } from "src/users/dto/response-user.dto";

@Injectable()
export class CurrentUserPipe implements PipeTransform {
	public constructor(private readonly usersService: UsersService) {}

	public async transform(value: JwtPayload, _metadata: ArgumentMetadata): Promise<ResponseUserDto> {
		console.log("metadata:", _metadata);
		console.log("CurrentUserPipe, value:", value);

		if (!value?.userId) {
			throw new UnauthorizedException("No user id in JWT payload");
		}
		// Find user by id (sub)
		const user = await this.usersService.findById(value.userId);
		if (!user) {
			throw new UnauthorizedException("User not found");
		}
		return user;
	}
}
