import { Expose } from "class-transformer";
import { RoomStatusEnum, RoomTypeEnum } from "../room.model";

// export class AmenityResponseDto {
//   @Expose()
//   public name!: string;

//   @Expose()
//   public isPremium?: boolean;

//   @Expose()
//   public description?: string;
// }

export class ResponseRoomDto {
	@Expose()
	public id!: string;

	@Expose()
	public roomNumber!: number;

	@Expose()
	public roomType!: RoomTypeEnum;

	@Expose()
	public roomStatus!: RoomStatusEnum;

	@Expose()
	public hasSeaView!: boolean;

	//   @Expose()
	//   public maxOccupancy!: number;

	//   @Expose()
	//   @Transform((params): AmenityResponseDto[] => params.value || [])
	//   public amenities!: AmenityResponseDto[];

	//   @Expose()
	//   public lastMaintenance?: Date;

	@Expose()
	public createdAt!: Date;

	@Expose()
	public updatedAt!: Date;

	// @Expose()
	// public get displayName(): string {
	// 	return `Room ${this.roomNumber} (${this.roomType})`;
	// }

	// @Expose()
	// public get isAvailable(): boolean {
	// 	return this.status === RoomStatus.AVAILABLE;
	// }
}
