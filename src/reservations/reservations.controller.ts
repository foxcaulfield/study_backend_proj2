import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { ReservationDocument } from "./reservation.model";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { ResponseReservationDto } from "./dto/response-reservation.dto";
import { plainToClass } from "class-transformer";

@Controller("reservations")
export class ReservationsController {
	public constructor(private readonly reservationsService: ReservationsService) {}
	@Post("create")
	public create(@Body() dto: CreateReservationDto): Promise<ReservationDocument> {
		return this.reservationsService.create(dto);
	}

	@Patch("update/:id")
	public update(@Body() dto: UpdateReservationDto, @Param("id") id: string): Promise<ReservationDocument> {
		return this.reservationsService.update(id, dto);
	}

	@Delete("delete/:id")
	public delete(@Param("id") id: string): Promise<ReservationDocument | null> {
		return this.reservationsService.delete(id);
	}

	@Get("item/:id")
	public getById(@Param("id") id: string): Promise<ReservationDocument | null> {
		return this.reservationsService.getById(id);
	}

	@Post("find")
	public async findAll(@Body() filter: { limit: number }): Promise<ResponseReservationDto[]> {
		const rawResult = await this.reservationsService.getAll(filter);
		const result = rawResult.map(
			(rawReservation): ResponseReservationDto => plainToClass(ResponseReservationDto, rawReservation),
		);
		return result;
	}
}
