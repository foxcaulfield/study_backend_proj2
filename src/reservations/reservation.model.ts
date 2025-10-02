import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { Room } from "src/rooms/room.model";

@Schema({ strict: true, timestamps: true })
export class Reservation {
	@Prop({ type: Types.ObjectId, ref: Room.name, required: true })
	public room!: Types.ObjectId;

	@Prop({
		type: Date,
		required: true,
		// min: new Date(date.setHours(0, 0, 0, 0)),
		set: (date: Date): Date => new Date(date.setHours(0, 0, 0, 0)),
		validate: {
			validator: (date: Date): boolean => {
				const todayMidnight = new Date(new Date().setHours(0, 0, 0, 0));
				// today.setUTCHours(0, 0, 0, 0);
				return date >= todayMidnight;
			},
			message: "Date can't be in the past",
		},
	})
	public checkInDate!: Date;

	@Prop({
		type: Date,
		required: true,
		// min: new Date(date.setHours(0, 0, 0, 0)),
		set: (date: Date): Date => new Date(date.setHours(0, 0, 0, 0)),
		validate: {
			validator: (date: Date): boolean => {
				const todayMidnight = new Date(new Date().setHours(0, 0, 0, 0));
				// const today = new Date();
				// today.setUTCHours(0, 0, 0, 0);
				return date >= todayMidnight;
			},
			message: "Date can't be in the past",
		},
	})
	public checkOutDate!: Date;
}

export type ReservationDocument = HydratedDocument<Reservation>;
export type ReservationModelType = Model<ReservationDocument>;
export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Index for efficient queries on room and dates (non-unique for ranges)
ReservationSchema.index({
	room: 1,
	checkInDate: 1,
	checkOutDate: 1,
});
// Pre-save hook example for validation
ReservationSchema.pre("save", function (next): void {
	if (this.checkInDate > this.checkOutDate) {
		return next(new Error("Start date must be before end date"));
	}
	next();
});
