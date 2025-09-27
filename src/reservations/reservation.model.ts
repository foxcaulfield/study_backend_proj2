import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Room } from "src/rooms/room.model";

@Schema({ strict: true, timestamps: true })
export class Reservation {
	@Prop({ type: Types.ObjectId, ref: Room.name, required: true })
	public room!: Types.ObjectId;

	@Prop({ type: Date })
	public reservationDate!: Date;
}

export type ReservationDocument = HydratedDocument<Reservation>;
export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Compound unique index on room and reservationDay
ReservationSchema.index({ room: 1, reservationDay: 1 }, { unique: true });
