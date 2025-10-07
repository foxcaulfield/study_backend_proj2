import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";

export enum UserRoleEnum {
	USER = "USER",
	ADMIN = "ADMIN",
}

@Schema()
export class User {
	@Prop({
		type: String,
		unique: true,
	})
	public email!: string;

	@Prop({
		type: String,
	})
	public passwordHash!: string;

	@Prop({
		type: String,
	})
	public fullname!: string;

	@Prop({
		type: String,
	})
	public phone!: string;

	@Prop({
		type: String,
		enum: UserRoleEnum,
		default: UserRoleEnum.USER,
	})
	public role!: UserRoleEnum;
}

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument>;
export const UserSchema = SchemaFactory.createForClass(User);
