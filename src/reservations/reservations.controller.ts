import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { Serialize } from "./interceptors/serialize.interceptor";
import { ResponseReservationDto } from "./dto/response-reservation.dto";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRoleEnum } from "src/users/user.model";
import { CurrentUser } from "src/decorators/current-user.decorator";
import { CurrentUserPipe } from "src/pipes/current-user.pipe";
import { ResponseUserDto } from "src/users/dto/response-user.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("reservations")
@Serialize(ResponseReservationDto)
export class ReservationsController {
	public constructor(private readonly reservationsService: ReservationsService) {}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	public async create(
		@Body() createReservationDto: CreateReservationDto,
		@CurrentUser(undefined, CurrentUserPipe) currentUser: ResponseUserDto,
	): Promise<ResponseReservationDto | null> {
		return await this.reservationsService.create(createReservationDto, currentUser);
	}

	@Roles(UserRoleEnum.ADMIN)
	@Get()
	public async findAll(): Promise<ResponseReservationDto[]> {
		return await this.reservationsService.findAll();
	}

	@Roles(UserRoleEnum.ADMIN)
	@Get("room/:roomId")
	public async findByRoom(@Param("roomId") roomId: string): Promise<ResponseReservationDto[]> {
		return await this.reservationsService.findByRoom(roomId);
	}

	// @Get("availability/:roomId")
	// public async checkAvailability(
	// 	@Param("roomId") roomId: string,
	// 	@Body("startDate") startDate?: Date,
	// 	@Body("endDate") endDate?: Date,
	// ): Promise<{ available: boolean; conflictingDates?: Date[] }> {
	// 	return await this.reservationsService.getRoomAvailability(roomId, startDate, endDate);
	// }

	@Roles(UserRoleEnum.ADMIN)
	@Get(":id")
	public async findOne(@Param("id") id: string): Promise<ResponseReservationDto | null> {
		return await this.reservationsService.findOne(id);
	}

	@Roles(UserRoleEnum.ADMIN)
	@Patch(":id")
	@UsePipes(new ValidationPipe({ transform: true }))
	public async update(
		@Param("id") id: string,
		@Body() updateReservationDto: UpdateReservationDto,
	): Promise<ResponseReservationDto | null> {
		return await this.reservationsService.update(id, updateReservationDto);
	}

	@Delete(":id")
	public async remove(
		@Param("id") id: string,
		@CurrentUser(undefined, CurrentUserPipe) currentUser: ResponseUserDto,
	): Promise<ResponseReservationDto | null> {
		return await this.reservationsService.remove(id, currentUser);
	}
}
