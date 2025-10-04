import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { Serialize } from "./interceptors/serialize.interceptor";
import { ResponseReservationDto } from "./dto/response-reservation.dto";

@Controller("reservations")
@Serialize(ResponseReservationDto)
export class ReservationsController {
	public constructor(private readonly reservationsService: ReservationsService) {}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	public async create(@Body() createReservationDto: CreateReservationDto): Promise<ResponseReservationDto | null> {
		return await this.reservationsService.create(createReservationDto);
	}

	@Get()
	public async findAll(): Promise<ResponseReservationDto[]> {
		return await this.reservationsService.findAll();
	}

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

	@Get(":id")
	public async findOne(@Param("id") id: string): Promise<ResponseReservationDto | null> {
		return await this.reservationsService.findOne(id);
	}

	@Patch(":id")
	@UsePipes(new ValidationPipe({ transform: true }))
	public async update(
		@Param("id") id: string,
		@Body() updateReservationDto: UpdateReservationDto,
	): Promise<ResponseReservationDto | null> {
		return await this.reservationsService.update(id, updateReservationDto);
	}

	@Delete(":id")
	public async remove(@Param("id") id: string): Promise<ResponseReservationDto | null> {
		return await this.reservationsService.remove(id);
	}
}
