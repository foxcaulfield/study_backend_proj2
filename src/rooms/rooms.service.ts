import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Room, RoomDocument, RoomStatusEnum, type RoomModelType } from "./room.model";
import { CreateRoomDto } from "./dto/create-room.dto";
import { ResponseRoomDto } from "./dto/response-room.dto";
import { plainToInstance } from "class-transformer";
import { FilterRoomDto } from "./dto/filter-room.dto";
import { RootFilterQuery, Types } from "mongoose";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Injectable()
export class RoomsService {
	public constructor(
		@InjectModel(Room.name)
		private readonly roomModel: RoomModelType,
	) {}

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

		const responseDto = plainToInstance(ResponseRoomDto, roomInstance, {
			excludeExtraneousValues: true,
		});

		return responseDto;
	}

	public async findAll(filterDto: FilterRoomDto): Promise<{
		rooms: RoomDocument[];
		total: number;
		page: number;
		limit: number;
		pages: number;
	}> {
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
			rooms,
			total,
			page: pageValue,
			limit: limitValue,
			pages: Math.ceil(total / limitValue),
		};
	}

	public async findById(id: string): Promise<RoomDocument> {
		const room = await this.roomModel.findById(new Types.ObjectId(id));

		if (!room) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}

		return room;
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

	public async remove(id: string): Promise<void> {
		const result = await this.roomModel.findOneAndDelete(new Types.ObjectId(id));

		if (!result) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}
	}

	public async findAvailableRooms(): Promise<RoomDocument[]> {
		return this.roomModel
			.find({
				roomStatus: RoomStatusEnum.AVAILABLE,
			})
			.sort({ roomStatus: 1 })
			.exec();
	}

	private buildFilterQuery(filters: Partial<FilterRoomDto>): RootFilterQuery<RoomDocument> {
		const query: RootFilterQuery<RoomDocument> = {};

		if (filters.roomType) {
			query.roomType = filters.roomType;
		}

		if (filters.status) {
			query.status = filters.status;
		}

		if (filters.hasSeaView !== undefined) {
			query.hasSeaView = filters.hasSeaView;
		}

		return query;
	}
}
