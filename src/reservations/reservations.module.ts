import { Module } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { ReservationsController } from "./reservations.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Reservation, ReservationSchema } from "./reservation.model";
// import { Room, RoomSchema } from "src/rooms/room.model";
import { RoomsModule } from "src/rooms/rooms.module";

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Reservation.name,
				schema: ReservationSchema,
			},
			// {
			// 	name: Room.name,
			// 	schema: RoomSchema,
			// },
		]),
		RoomsModule,
	],
	providers: [ReservationsService],
	controllers: [ReservationsController],
})
export class ReservationsModule {}
