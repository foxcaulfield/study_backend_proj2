import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Room, RoomDocument } from "./room.model";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Injectable()
export class RoomsService {
	public constructor(@InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>) {}

	public async create(dto: CreateRoomDto): Promise<RoomDocument> {
		// const instance2 = await this.roomModel.create([dto], { validateBeforeSave: true });
		const roomInstance = new this.roomModel(dto);
		await roomInstance.save({
			validateBeforeSave: true,
		});

		return roomInstance;
	}

	public async update(id: string, dto: UpdateRoomDto): Promise<RoomDocument> {
		const updatedRoom = await this.roomModel.findByIdAndUpdate(
			new Types.ObjectId(id),
			{ $set: dto },
			{ new: true, runValidators: true },
		);

		if (!updatedRoom) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}

		return updatedRoom;
	}

	public async delete(id: string): Promise<RoomDocument | null> {
		const deletedRoom = await this.roomModel.findByIdAndDelete(new Types.ObjectId(id));
		if (!deletedRoom) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}
		return deletedRoom;
	}

	public async getById(id: string): Promise<RoomDocument | null> {
		const room = await this.roomModel.findById(new Types.ObjectId(id));
		if (!room) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}
		return room;
	}

	public async getAll(filter: { limit?: number }): Promise<RoomDocument[]> {
		return this.roomModel
			.find(filter)
			.limit(filter.limit ?? 10)
			.exec();
	}
}
