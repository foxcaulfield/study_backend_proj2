import { IsDate, IsMongoId } from "class-validator";
import { Type } from "class-transformer";

export class CreateReservationDto {
	@IsMongoId()
	public room!: string;

	@IsDate()
	@Type((): typeof Date => Date)
	// @MinDate(new Date(date.setHours(0, 0, 0, 0), { message: "Check-in date cannot be in the past" })
	public checkInDate!: Date;

	@IsDate()
	// @Type(():typeof Date => Date)
	// @MinDate(new Date(date.setHours(0, 0, 0, 0), { message: "Check-out date cannot be in the past" })
	public checkOutDate!: Date;
}
