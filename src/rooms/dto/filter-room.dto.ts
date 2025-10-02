import { IsEnum, IsInt, IsBoolean, IsOptional, Min, Max, IsPositive, IsNumber } from "class-validator";
import { RoomStatusEnum, RoomTypeEnum } from "../room.model";

export class FilterRoomDto {
	@IsEnum(RoomTypeEnum)
	@IsOptional()
	public roomType?: RoomTypeEnum;

	@IsEnum(RoomStatusEnum)
	@IsOptional()
	public roomStatus?: RoomStatusEnum;

	//   @Type((): typeof Boolean => Boolean)
	@IsBoolean()
	@IsOptional()
	public hasSeaView?: boolean;

	//   @IsInt()
	//   @Min(1)
	//   @Max(6)
	//   @IsOptional()
	//   @Type((): typeof Number => Number)
	//   public minOccupancy?: number;

	//   @IsInt()
	//   @Min(0)
	//   @IsOptional()
	//   @Type((): typeof Number => Number)
	//   public maxPrice?: number;

	// @Type((): typeof Number => Number)
	@Min(1)
	@IsInt()
	@IsPositive()
	@IsNumber()
	@IsOptional()
	public page?: number = 1;

	// @Type((): typeof Number => Number)
	@Max(100)
	@Min(1)
	@IsInt()
	@IsPositive()
	@IsNumber()
	@IsOptional()
	public limit?: number = 10;
}
