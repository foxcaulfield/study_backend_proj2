import { Expose } from "class-transformer";

export class ResponseReservationDto {
	@Expose()
	public id!: string;

	@Expose()
	// @Transform(({ obj }) => obj.room?.toString())
	public room!: string;

	@Expose()
	// @Transform(({ value }) => value.toISOString().split("T")[0])
	public checkInDate!: string;

	@Expose()
	// @Transform(({ value }) => value.toISOString().split("T")[0])
	public checkOutDate!: string;

	@Expose()
	public createdAt!: Date;

	@Expose()
	public updatedAt!: Date;

	// @Expose()
	// @Transform(({ obj }) => {
	// 	const checkIn = new Date(obj.checkInDate);
	// 	const checkOut = new Date(obj.checkOutDate);
	// 	const timeDiff = checkOut.getTime() - checkIn.getTime();
	// 	return Math.ceil(timeDiff / (1000 * 3600 * 24));
	// })
	// nightsCount: number;
}
