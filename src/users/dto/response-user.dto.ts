import { Expose, Transform } from "class-transformer";
import { UserRoleEnum } from "../user.model";

interface HasToString {
	toString(): string;
}

interface HasId {
	id?: string;
	_id?: HasToString;
}

interface ArgWithObjWithId {
	obj: HasId;
}

export class ResponseUserDto {
	@Transform(({ obj }: ArgWithObjWithId): string => obj._id?.toString() ?? obj.id ?? "")
	@Expose()
	public id!: string;

	@Expose()
	public email!: string;

	@Expose()
	public fullname!: string;

	@Expose()
	public phone!: string;

	@Expose()
	public role!: UserRoleEnum;
}
