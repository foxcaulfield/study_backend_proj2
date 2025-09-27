import { IsDate, IsMongoId } from "class-validator";

export class CreateReservationDto {
	@IsMongoId()
	public room!: string;

	@IsDate()
	public reservationDate!: Date;
}
