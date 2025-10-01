import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { RoomStatusEnum, RoomTypeEnum } from "../room.model";

export class CreateRoomDto {
	@IsInt()
	@Min(1)
	@Max(1000)
	public roomNumber!: number;

	@IsEnum(RoomTypeEnum)
	public roomType!: RoomTypeEnum;

	@IsEnum(RoomStatusEnum)
	@IsOptional()
	public status?: RoomStatusEnum;

	@IsBoolean()
	@IsOptional()
	public hasSeaView?: boolean;
}
