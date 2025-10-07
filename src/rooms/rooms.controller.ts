import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	// Query,
	// UseInterceptors,
	// ParseIntPipe,
	HttpStatus,
	HttpCode,
	UseGuards,
	// ClassSerializerInterceptor,
} from "@nestjs/common";
// import { RoomService } from "./room.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { RoomsService } from "./rooms.service";
import { FilterRoomDto } from "./dto/filter-room.dto";
// import { RoomFilterDto } from "./dto/room-filter.dto";
// import { RoomResponseDto } from "./dto/room-response.dto";
// import { SerializeInterceptor } from "../interceptors/serialize.interceptor";
import { ResponseRoomDto } from "./dto/response-room.dto";
import { PaginatedResponse } from "./room.types";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { Public, Roles } from "src/decorators/roles.decorator";
import { UserRoleEnum } from "src/users/user.model";
import { RolesGuard } from "src/guards/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("rooms")
// @UseInterceptors(new ClassSerializerInterceptor(ResponseRoomDto))
export class RoomsController {
	public constructor(private readonly roomService: RoomsService) {}

	@Roles(UserRoleEnum.ADMIN)
	@Post()
	public async create(@Body() createRoomDto: CreateRoomDto): Promise<ResponseRoomDto> {
		return await this.roomService.create(createRoomDto);
	}

	@Post("get_all")
	public async findAll(@Body() filterDto: FilterRoomDto): Promise<PaginatedResponse> {
		return await this.roomService.findAll(filterDto);
	}

	@Public()
	@Get("available")
	public async findAvailable(): Promise<PaginatedResponse> {
		return await this.roomService.findAvailableRooms();
	}

	//   @Get("type/:type")
	//   public async findByType(
	//     @Param("type") type: RoomType
	//   ): Promise<RoomDocument[]> {
	//     return await this.roomService.findByType(type);
	//   }

	@Get(":id")
	public async findOne(@Param("id") id: string): Promise<ResponseRoomDto> {
		return await this.roomService.findById(id);
	}

	@Roles(UserRoleEnum.ADMIN)
	@Patch(":id")
	public async update(@Param("id") id: string, @Body() updateRoomDto: UpdateRoomDto): Promise<ResponseRoomDto> {
		return await this.roomService.update(id, updateRoomDto);
	}

	@Roles(UserRoleEnum.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	public async remove(@Param("id") id: string): Promise<void> {
		await this.roomService.remove(id);
	}
}
