import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.model";
import { CurrentUserPipe } from "src/pipes/current-user.pipe";

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
	],
	providers: [UsersService, CurrentUserPipe],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
