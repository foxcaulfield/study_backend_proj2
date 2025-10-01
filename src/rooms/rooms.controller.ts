import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { ResponseRoomDto } from "./dto/response-room.dto";
import { CreateRoomDto } from "./dto/create-room.dto";
import { RoomDocument } from "./room.model";
import { FilterRoomDto } from "./dto/filter-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Controller("rooms")
export class RoomsController {
	public constructor(private readonly roomService: RoomsService) {}

	@Post()
	public async create(@Body() createRoomDto: CreateRoomDto): Promise<ResponseRoomDto> {
		return await this.roomService.create(createRoomDto);
	}

	@Get()
	public async findAll(@Query() filterDto: FilterRoomDto): Promise<{
		rooms: RoomDocument[];
		total: number;
		page: number;
		limit: number;
		pages: number;
	}> {
		return await this.roomService.findAll(filterDto);
	}

	@Get("available")
	public async findAvailable(): Promise<RoomDocument[]> {
		return await this.roomService.findAvailableRooms();
	}

	// @Get("type/:type")
	// public async findByType(@Param("type") type: RoomTypeEnum): Promise<RoomDocument[]> {
	// 	return await this.roomService.findByType(type);
	// }

	@Get(":id")
	public async findOne(@Param("id") id: string): Promise<RoomDocument> {
		return await this.roomService.findById(id);
	}

	@Patch(":id")
	public async update(@Param("id") id: string, @Body() updateRoomDto: UpdateRoomDto): Promise<RoomDocument> {
		return await this.roomService.update(id, updateRoomDto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	public async remove(@Param("id") id: string): Promise<void> {
		await this.roomService.remove(id);
	}
}
