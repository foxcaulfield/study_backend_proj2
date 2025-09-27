import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum RoomType {
	STANDARD_ROOM = "STANDARD_ROOM", // Basic room type with essential amenities
	DELUXE_ROOM = "DELUXE_ROOM", // Larger than standard, often with upgraded amenities or better view
	STUDIO_ROOM = "STUDIO_ROOM", // Open-plan room combining living, sleeping, and sometimes kitchen area
	SUITE = "SUITE", // Separate living and sleeping areas
}

@Schema({ strict: true, timestamps: true })
export class Room {
	@Prop({ type: Number, unique: true })
	public roomNumber!: number;

	@Prop({ enum: RoomType, type: String, default: RoomType.STANDARD_ROOM })
	public roomType!: RoomType;

	@Prop()
	public hasSeaView!: boolean;
}

export type RoomDocument = HydratedDocument<Room>;
export const RoomSchema = SchemaFactory.createForClass(Room);
