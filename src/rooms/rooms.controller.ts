import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { RoomDocument } from "./room.model";
import { RoomsService } from "./rooms.service";
import { plainToClass } from "class-transformer";
import { ResponseRoomDto } from "./dto/response-room.dto";

@Controller("rooms")
export class RoomsController {
	public constructor(private readonly roomsService: RoomsService) {}
	@Post("create")
	public create(@Body() dto: CreateRoomDto): Promise<RoomDocument> {
		return this.roomsService.create(dto);
	}

	@Patch("update/:id")
	public update(@Body() dto: UpdateRoomDto, @Param("id") id: string): Promise<RoomDocument> {
		return this.roomsService.update(id, dto);
	}

	@Delete("delete/:id")
	public delete(@Param("id") id: string): Promise<RoomDocument | null> {
		return this.roomsService.delete(id);
	}

	@Get("item/:id")
	public getById(@Param("id") id: string): Promise<RoomDocument | null> {
		return this.roomsService.getById(id);
	}

	@Post("find")
	public async findAll(@Body() filter: { limit: number }): Promise<ResponseRoomDto[]> {
		const rawResult = await this.roomsService.getAll(filter);
		const result = rawResult.map((rawRoom): ResponseRoomDto => plainToClass(ResponseRoomDto, rawRoom));
		return result;
	}
}
