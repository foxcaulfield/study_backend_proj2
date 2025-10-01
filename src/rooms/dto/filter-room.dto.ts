import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";
import { RoomStatusEnum, RoomTypeEnum } from "../room.model";

export class FilterRoomDto {
	@IsEnum(RoomTypeEnum)
	@IsOptional()
	public roomType?: RoomTypeEnum;

	@IsEnum(RoomStatusEnum)
	@IsOptional()
	public status?: RoomStatusEnum;

	@IsBoolean()
	@IsOptional()
	public hasSeaView?: boolean;

	@Min(1)
	@IsInt()
	@IsPositive()
	@IsNumber()
	@IsOptional()
	public page?: number = 1;

	@Max(100)
	@Min(1)
	@IsInt()
	@IsPositive()
	@IsNumber()
	@IsOptional()
	public limit?: number = 10;
}
