import { IsDate, IsMongoId } from "class-validator";

export class ResponseReservationDto {
	@IsMongoId()
	public room!: string;

	@IsDate()
	public reservationDate!: Date;
}
