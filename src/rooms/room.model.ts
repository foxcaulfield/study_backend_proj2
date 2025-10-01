import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";

export enum RoomTypeEnum {
	STANDARD_ROOM = "STANDARD_ROOM",
	DELUXE_ROOM = "DELUXE_ROOM",
	STUDIO_ROOM = "STUDIO_ROOM",
	SUITE = "SUITE",
	FAMILY_ROOM = "FAMILY_ROOM",
}

export enum RoomStatusEnum {
	AVAILABLE = "AVAILABLE",
	OCCUPIED = "OCCUPIED",
	MAINTENANCE = "MAINTENANCE",
	CLEANING = "CLEANING",
}

@Schema({
	strict: true,
	timestamps: true,
	toJSON: {
		virtuals: false,
	},
})
export class Room {
	@Prop({
		type: Number,
		unique: true,
		required: true,
		min: 1,
		max: 1000,
		index: true,
	})
	public roomNumber!: number;

	@Prop({
		type: String,
		enum: RoomTypeEnum,
		default: RoomTypeEnum.STANDARD_ROOM,
	})
	public roomType!: RoomTypeEnum;

	@Prop({
		type: String,
		enum: RoomStatusEnum,
		default: RoomStatusEnum.AVAILABLE,
	})
	public roomStatus!: RoomStatusEnum;

	@Prop(Boolean)
	public hasSeaView!: boolean;
}

export type RoomDocument = HydratedDocument<Room>;
export type RoomModelType = Model<RoomDocument> & typeof Room;
export const RoomSchema = SchemaFactory.createForClass(Room);
