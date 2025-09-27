import { IsBoolean, IsEnum, IsNumber } from "class-validator";
import { RoomType } from "../room.model";

export class CreateRoomDto {
	@IsNumber()
	public roomNumber!: number;

	@IsEnum(RoomType)
	public roomType!: RoomType;

	@IsBoolean()
	public hasSeaView!: boolean;
}
