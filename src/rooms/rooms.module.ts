import { Module } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { RoomsController } from "./rooms.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Room, RoomSchema } from "./room.model";

@Module({
	imports: [MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }])],
	providers: [RoomsService],
	controllers: [RoomsController],
})
export class RoomsModule {}
