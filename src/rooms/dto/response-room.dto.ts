import { Expose } from "class-transformer";
import { RoomStatusEnum, RoomTypeEnum } from "../room.model";

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

	@Expose()
	public createdAt!: Date;

	@Expose()
	public updateAt!: Date;
}
