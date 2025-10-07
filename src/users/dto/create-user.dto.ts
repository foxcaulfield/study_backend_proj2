import { IsString, MinLength } from "class-validator";
// import { UserRoleEnum } from "../user.model";

export class CreateUserDto {
	@IsString()
	public email!: string;

	@MinLength(6)
	@IsString()
	public password!: string;

	@IsString()
	public fullname!: string;

	@IsString()
	public phone!: string;

	// @IsEnum(UserRoleEnum)
	// public role!: UserRoleEnum;
}
