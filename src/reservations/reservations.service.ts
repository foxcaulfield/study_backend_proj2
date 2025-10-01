import { Injectable, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Reservation, ReservationDocument } from "./reservation.model";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { ResponseReservationDto } from "./dto/response-reservation.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ReservationsService {
	public constructor(
		@InjectModel(Reservation.name)
		private readonly reservationModel: Model<ReservationDocument>,
	) {}

	private normalizeDate(date: Date): Date {
		return new Date(date.setHours(0, 0, 0, 0));
	}

	public async checkRoomAvailability(
		roomId: string,
		checkInDate: Date,
		checkOutDate: Date,
		// excludeReservationId?: string,
	): Promise<boolean> {
		const normalizedCheckIn = this.normalizeDate(new Date(checkInDate));
		const normalizedCheckOut = this.normalizeDate(new Date(checkOutDate));

		const query: Parameters<typeof this.reservationModel.findOne>[number] = {
			room: new Types.ObjectId(roomId),
			$or: [
				{
					checkInDate: { $lt: normalizedCheckOut },
					checkOutDate: { $gt: normalizedCheckIn },
				},
			],
		};

		// if (excludeReservationId) {
		// 	query.id = { $ne: new Types.ObjectId(excludeReservationId) };
		// } /* id! */

		const conflictingReservation = await this.reservationModel.findOne(query);
		return !conflictingReservation;
	}

	public async create(createReservationDto: CreateReservationDto): Promise<ResponseReservationDto> {
		const { room, checkInDate, checkOutDate } = createReservationDto;

		if (checkInDate >= checkOutDate) {
			throw new BadRequestException("Check-out date must be after check-in date");
		}

		const isAvailable = await this.checkRoomAvailability(room, checkInDate, checkOutDate);
		if (!isAvailable) {
			throw new ConflictException("Room is not available for the selected dates");
		}

		const reservation = new this.reservationModel(createReservationDto);
		// !!! + transformation
		await reservation.save();

		const responseDto = plainToInstance(ResponseReservationDto, reservation, {
			excludeExtraneousValues: true,
		});

		return responseDto;
	}

	public async findAll(): Promise<ResponseReservationDto[]> {
		const result = await this.reservationModel.find().populate("room").exec();

		const responseDto = plainToInstance(ResponseReservationDto, result, {
			excludeExtraneousValues: true,
		});

		return responseDto;
	}

	public async findByRoom(roomId: string): Promise<ResponseReservationDto[]> {
		const result = await this.reservationModel
			.find({ room: new Types.ObjectId(roomId) })
			.sort({ checkInDate: 1 })
			.exec();

		const responseDto = plainToInstance(ResponseReservationDto, result, {
			excludeExtraneousValues: true,
		});

		return responseDto;
	}

	public async findOne(id: string): Promise<ResponseReservationDto> {
		// new Types.ObjectId(id), /* ??? */
		const reservation = await this.reservationModel.findById(id).populate("room").exec();

		if (!reservation) {
			throw new NotFoundException(`Reservation with ID ${id} not found`);
		}

		const responseDto = plainToInstance(ResponseReservationDto, reservation, {
			excludeExtraneousValues: true,
		});

		return responseDto;
	}

	public async update(id: string, updateReservationDto: UpdateReservationDto): Promise<ResponseReservationDto> {
		const existingReservation = await this.findOne(id);

		const { room, checkInDate, checkOutDate } = updateReservationDto;

		// Если обновляются даты или комната - проверяем доступность
		if (room || checkInDate || checkOutDate) {
			const finalRoom = room || existingReservation.room.toString();
			const finalCheckIn = checkInDate || existingReservation.checkInDate; /* !!! */
			const finalCheckOut = checkOutDate || existingReservation.checkOutDate;

			if (finalCheckIn >= finalCheckOut) {
				throw new BadRequestException("Check-out date must be after check-in date");
			}

			const isAvailable = await this.checkRoomAvailability(
				finalRoom,
				new Date(finalCheckIn),
				new Date(finalCheckOut),
			);

			if (!isAvailable) {
				throw new ConflictException("Room is not available for the selected dates");
			}
		}

		const updatedReservation = await this.reservationModel
			.findByIdAndUpdate(
				// new Types.ObjectId(id), /* ??? */
				id,
				{
					...(room && { room: new Types.ObjectId(room) }),
					...(checkInDate && { checkInDate }),
					...(checkOutDate && { checkOutDate }),
				},
				{ new: true, runValidators: true },
			)
			.populate("room")
			.exec();

		if (!updatedReservation) {
			throw new NotFoundException(`Reservation with ID ${id} not found`);
		}
		const responseDto = plainToInstance(ResponseReservationDto, updatedReservation, {
			excludeExtraneousValues: true,
		});

		return responseDto;
	}

	public async remove(id: string): Promise<ResponseReservationDto | null> {
		const result = await this.reservationModel.findByIdAndDelete(id).exec();
		if (!result) {
			throw new NotFoundException(`Reservation with ID ${id} not found`);
		}
		const responseDto = plainToInstance(ResponseReservationDto, result, {
			excludeExtraneousValues: true,
		});

		return responseDto;
	}

	public async getRoomAvailability(
		roomId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<{ available: boolean; conflictingDates?: Date[] }> {
		const normalizedStart = startDate ? this.normalizeDate(new Date(startDate)) : this.normalizeDate(new Date());
		const normalizedEnd = endDate
			? this.normalizeDate(new Date(endDate))
			: new Date(normalizedStart.getTime() + 30 * 24 * 60 * 60 * 1000);

		const conflicts = await this.reservationModel
			.find({
				room: new Types.ObjectId(roomId),
				$or: [
					{
						checkInDate: { $lt: normalizedEnd },
						checkOutDate: { $gt: normalizedStart },
					},
				],
			})
			.sort({ checkInDate: 1 })
			.exec();

		return {
			available: conflicts.length === 0,
			conflictingDates: conflicts.map((res): Date => res.checkInDate),
		};
	}
}
