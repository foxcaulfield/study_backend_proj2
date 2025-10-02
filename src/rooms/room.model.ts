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

// // Nested schema
// @Schema({ _id: false })
// export class Amenity {
// 	@Prop({ required: true, trim: true })
// 	public name!: string;

// 	@Prop({ default: false })
// 	public isPremium?: boolean;

// 	@Prop()
// 	public description?: string;
// }

// Main schema
@Schema({
	strict: true,
	timestamps: true,
	// toJSON: {
	// 	virtuals: false,
	// },
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
		default: RoomStatusEnum.MAINTENANCE,
	})
	public roomStatus!: RoomStatusEnum;

	@Prop(Boolean)
	public hasSeaView!: boolean;

	// @Prop(String)
	public id?: string;

	// @Prop(Date)
	public createdAt?: Date;

	// @Prop(Date)
	public updatedAt?: Date;
	// @Prop({
	// 	type: Number,
	// 	min: 1,
	// 	max: 6,
	// })
	// public maxOccupancy!: number;

	// @Prop({
	// 	type: [Amenity],
	// 	validate: {
	// 		validator: (arr: Amenity[]): boolean => arr.length <= 5,
	// 		message: "Amenity limit is 5",
	// 	},
	// })
	// public amenities!: Amenity[];

	// @Prop({ type: Date })
	// public lastMaintenance?: Date;

	// /* Virtual fields */
	// public get displayName(): string {
	// 	return `Room ${this.roomNumber} (${this.roomType})`;
	// }
	// public get isAvailable(): boolean {
	// 	return this.status === RoomStatus.AVAILABLE;
	// }

	// /* Methods */
	// public hasAmenity(amenityName: string): boolean {
	// 	return this.amenities?.some((a): boolean => a.name === amenityName) ?? false;
	// }

	// /* Static */
	// public static async findByType(this: RoomModelType, roomType: RoomType): Promise<RoomDocument[]> {
	// 	return this.find({ roomType }).exec();
	// }
}
export type RoomDocument = HydratedDocument<Room>;
export type RoomModelType = Model<RoomDocument>;
export const RoomSchema = SchemaFactory.createForClass(Room);
