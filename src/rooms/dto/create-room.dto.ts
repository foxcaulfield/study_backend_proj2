import { IsEnum, IsInt, IsBoolean, Min, Max, IsOptional, IsString, IsArray } from "class-validator";
import { RoomTypeEnum } from "../room.model";

// export class AmenityDto {
//   @IsBoolean()
//   @IsOptional()
//   public isPremium?: boolean;
//   @IsOptional()
//   public description?: string;
// }

export class CreateRoomDto {
	@IsInt()
	@Min(1)
	@Max(1000)
	public roomNumber!: number;

	@IsEnum(RoomTypeEnum)
	public roomType!: RoomTypeEnum;

	// @IsEnum(RoomStatusEnum)
	// @IsOptional()
	// public roomStatus?: RoomStatusEnum = RoomStatusEnum.MAINTENANCE;

	@IsBoolean()
	@IsOptional()
	public hasSeaView?: boolean;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	public images?: Array<string>;

	//   @IsInt()
	//   @Min(1)
	//   @Max(6)
	//   public maxOccupancy!: number;

	//   @IsArray()
	//   @ValidateNested({ each: true })
	//   @Type((): typeof AmenityDto => AmenityDto)
	//   @IsOptional()
	//   public amenities?: AmenityDto[];

	//   @IsDate()
	//   @Type((): typeof Date => Date)
	//   @IsOptional()
	//   public lastMaintenance?: Date;
}
