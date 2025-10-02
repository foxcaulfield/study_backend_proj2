import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { RootFilterQuery, Types } from "mongoose";
import { Room, RoomDocument, RoomStatusEnum, type RoomModelType } from "./room.model";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { FilterRoomDto } from "./dto/filter-room.dto";
// import { ResponseRoomDto } from "./dto/response-room.dto";
import { plainToInstance } from "class-transformer";
import { ResponseRoomDto } from "./dto/response-room.dto";
import { PaginatedResponse } from "./room.types";

@Injectable()
export class RoomsService {
	private toResponseDto(entity: RoomDocument): ResponseRoomDto;
	private toResponseDto(entity: RoomDocument[]): ResponseRoomDto[];
	private toResponseDto(entity: RoomDocument | RoomDocument[]): ResponseRoomDto | ResponseRoomDto[] {
		return plainToInstance(ResponseRoomDto, entity, {
			excludeExtraneousValues: true,
		});
	}

	public constructor(
		@InjectModel(Room.name)
		private readonly roomModel: RoomModelType,
	) {}

	public async checkRoomExists(id: string): Promise<boolean> {
		return !!(await this.roomModel.exists({ _id: new Types.ObjectId(id) }));
	}

	public async create(dto: CreateRoomDto): Promise<ResponseRoomDto> {
		const existingRoom = await this.roomModel
			.findOne({
				roomNumber: dto.roomNumber,
			})
			.exec();

		if (existingRoom) {
			throw new ConflictException(`Room with number ${dto.roomNumber} already exists`);
		}

		const roomInstance = new this.roomModel(dto);
		await roomInstance.save({
			validateBeforeSave: true,
		});

		const responseDto = this.toResponseDto(roomInstance);

		return responseDto;
	}

	public async findAll(filterDto: FilterRoomDto): Promise<PaginatedResponse> {
		const { page, limit, ...filters } = filterDto;
		const skip = page === undefined || limit === undefined ? 0 : (page - 1) * limit;
		const limitValue = limit ?? 10;
		const pageValue = page ?? 0;
		const query = this.buildFilterQuery(filters);

		const [rooms, total] = await Promise.all([
			this.roomModel.find(query).sort({ roomNumber: 1 }).skip(skip).limit(limitValue).exec(),
			this.roomModel.countDocuments(query).exec(),
		]);

		return {
			rooms: this.toResponseDto(rooms),
			total,
			page: pageValue,
			limit: limitValue,
			pages: Math.ceil(total / limitValue),
		};
	}

	public async findById(id: string): Promise<ResponseRoomDto> {
		const room = await this.roomModel.findById(new Types.ObjectId(id));

		if (!room) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}

		return this.toResponseDto(room);
	}

	public async update(id: string, dto: UpdateRoomDto): Promise<ResponseRoomDto> {
		/* if (dto.roomNumber) {
			const existingRoom = await this.roomModel.findOne({
				roomNumber: dto.roomNumber,
				_id: { $ne: new Types.ObjectId(id) },
			});

			if (existingRoom) {
				throw new ConflictException(`Room with number ${dto.roomNumber} already exists`);
			}
		} */

		const updatedRoom = await this.roomModel.findByIdAndUpdate(
			new Types.ObjectId(id),
			{ $set: dto },
			{ new: true, runValidators: true },
		);

		if (!updatedRoom) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}

		return this.toResponseDto(updatedRoom);
	}

	public async remove(id: string): Promise<void> {
		const result = await this.roomModel.findByIdAndDelete(new Types.ObjectId(id));

		if (!result) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}
	}

	// public async findByType(roomType: RoomType): Promise<RoomDocument[]> {
	// 	return this.roomModel.findByType(roomType);
	// }

	public async findAvailableRooms(): Promise<PaginatedResponse> {
		// const result = await this.roomModel
		// 	.find({
		// 		roomStatus: RoomStatusEnum.AVAILABLE,
		// 	})
		// 	.sort({ roomNumber: 1 })
		// 	.exec();

		// return this.toResponseDto(result);

		return this.findAll({ roomStatus: RoomStatusEnum.AVAILABLE });
	}

	private buildFilterQuery(filters: Partial<FilterRoomDto>): RootFilterQuery<ResponseRoomDto> {
		const query: RootFilterQuery<ResponseRoomDto> = {};

		if (filters.roomType) {
			query.roomType = filters.roomType;
		}

		if (filters.roomStatus) {
			query.roomStatus = filters.roomStatus;
		}

		if (filters.hasSeaView !== undefined) {
			query.hasSeaView = filters.hasSeaView;
		}

		// if (filters.minOccupancy) {
		// 	query.maxOccupancy = { $gte: filters.minOccupancy };
		// }

		// if (filters.maxPrice) {
		// 	query["pricing.basePrice"] = { $lte: filters.maxPrice };
		// }

		return query;
	}

	// public async update(id: string, dto: UpdateRoomDto): Promise<RoomDocument> {
	// 	const updatedRoom = await this.roomModel.findByIdAndUpdate(
	// 		new Types.ObjectId(id),
	// 		{ $set: dto },
	// 		{ new: true, runValidators: true },
	// 	);

	// 	if (!updatedRoom) {
	// 		throw new NotFoundException(`Room with ID ${id} not found`);
	// 	}

	// 	return updatedRoom;
	// }

	// public async delete(id: string): Promise<RoomDocument | null> {
	// 	const deletedRoom = await this.roomModel.findByIdAndDelete(new Types.ObjectId(id));
	// 	if (!deletedRoom) {
	// 		throw new NotFoundException(`Room with ID ${id} not found`);
	// 	}
	// 	return deletedRoom;
	// }

	// public async getById(id: string): Promise<RoomDocument | null> {
	// 	const room = await this.roomModel.findById(new Types.ObjectId(id));
	// 	if (!room) {
	// 		throw new NotFoundException(`Room with ID ${id} not found`);
	// 	}
	// 	return room;
	// }

	// public async getAll(filter: { limit?: number }): Promise<RoomDocument[]> {
	// 	return this.roomModel
	// 		.find(filter)
	// 		.limit(filter.limit ?? 10)
	// 		.exec();
	// }
}
