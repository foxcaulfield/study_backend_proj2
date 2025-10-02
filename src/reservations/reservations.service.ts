import { Injectable, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Reservation, ReservationDocument } from "./reservation.model";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { ResponseReservationDto } from "./dto/response-reservation.dto";
import { plainToInstance } from "class-transformer";
import { RoomsService } from "src/rooms/rooms.service";
// import { Room, type RoomModelType } from "src/rooms/room.model";

@Injectable()
export class ReservationsService {
	public constructor(
		@InjectModel(Reservation.name)
		private readonly reservationModel: Model<ReservationDocument>,
		// @InjectModel(Room.name)
		// private readonly roomModel: RoomModelType,
		private readonly roomService: RoomsService,
	) {}

	private toResponseDto(entity: ReservationDocument): ResponseReservationDto;
	private toResponseDto(entity: ReservationDocument[]): ResponseReservationDto[];
	private toResponseDto(
		entity: ReservationDocument | ReservationDocument[],
	): ResponseReservationDto | ResponseReservationDto[] {
		return plainToInstance(ResponseReservationDto, entity, {
			excludeExtraneousValues: true,
		});
	}

	private normalizeDate(date: Date): Date {
		return new Date(date.setHours(0, 0, 0, 0));
	}

	private async ensureRoomExists(roomId: string): Promise<void> {
		const doesRoomExist = await this.roomService.checkRoomExists(roomId);

		if (!doesRoomExist) {
			throw new NotFoundException("Room is not found");
		}
	}

	private checkDatesAreValid(checkInDate: Date, checkOutDate: Date): void {
		if (checkInDate > checkOutDate) {
			throw new BadRequestException("Check-out date must be after or equal check-in date");
		}
	}

	public async ensureRoomAvailable(
		roomId: string,
		checkInDate: Date,
		checkOutDate: Date,
		excludeReservationId?: string,
	): Promise<void> {
		const normalizedCheckIn = this.normalizeDate(new Date(checkInDate));
		const normalizedCheckOut = this.normalizeDate(new Date(checkOutDate));

		const query: Parameters<typeof this.reservationModel.findOne>[0] = {
			room: new Types.ObjectId(roomId) /* important */,
			$or: [
				{
					$and: [{ checkInDate: { $lt: normalizedCheckOut } }, { checkOutDate: { $gt: normalizedCheckIn } }],
				},
				{
					$or: [{ checkOutDate: { $eq: normalizedCheckIn } }, { checkInDate: { $eq: normalizedCheckOut } }],
				},
			],
		};

		if (excludeReservationId) {
			query._id = { $ne: new Types.ObjectId(excludeReservationId) };
		} /* id! */

		const conflictingReservation = await this.reservationModel.findOne(query);
		// return !conflictingReservation;
		if (conflictingReservation) {
			throw new ConflictException("Room is not available for the selected dates");
		}
	}

	public async create(createReservationDto: CreateReservationDto): Promise<ResponseReservationDto> {
		const { room: roomId, checkInDate, checkOutDate, ...restOfDto } = createReservationDto;

		await this.ensureRoomExists(roomId);
		this.checkDatesAreValid(checkInDate, checkOutDate);
		await this.ensureRoomAvailable(roomId, checkInDate, checkOutDate);

		const reservation = new this.reservationModel({
			room: new Types.ObjectId(roomId) /* important */,
			checkInDate,
			checkOutDate,
			...restOfDto,
		});

		await reservation.save();

		return this.toResponseDto(reservation);
	}

	public async findAll(): Promise<ResponseReservationDto[]> {
		const result = await this.reservationModel.find().exec();
		return this.toResponseDto(result);
	}

	public async findByRoom(roomId: string): Promise<ResponseReservationDto[]> {
		const result = await this.reservationModel
			.find({ room: new Types.ObjectId(roomId) })
			.sort({ checkInDate: 1 })
			.exec();

		return this.toResponseDto(result);
	}

	public async findOne(id: string): Promise<ResponseReservationDto> {
		const reservation = await this.reservationModel.findById(id).exec();

		if (!reservation) {
			throw new NotFoundException(`Reservation with ID ${id} not found`);
		}

		return this.toResponseDto(reservation);
	}

	public async update(id: string, updateReservationDto: UpdateReservationDto): Promise<ResponseReservationDto> {
		// 1. Найти существующее бронирование
		const existingReservation = await this.reservationModel.findById(id).exec();
		if (!existingReservation) {
			throw new NotFoundException(`Reservation with ID ${id} not found`);
		}

		// 2. Извлечь обновляемые поля
		const {
			room: newRoomId,
			checkInDate: newCheckIn,
			checkOutDate: newCheckOut,
			// ...otherUpdates
		} = updateReservationDto;

		// 3. Подготовить финальные значения для проверки и обновления
		const finalRoomId = newRoomId ? newRoomId : existingReservation.room.toString();
		const finalCheckIn = newCheckIn ? new Date(newCheckIn) : existingReservation.checkInDate;
		const finalCheckOut = newCheckOut ? new Date(newCheckOut) : existingReservation.checkOutDate;

		// 4. Выполнить проверки (если обновляются связанные поля)
		if (newRoomId || newCheckIn || newCheckOut) {
			this.checkDatesAreValid(finalCheckIn, finalCheckOut);
			if (newRoomId) {
				await this.ensureRoomExists(finalRoomId);
			}
			// Важно: исключаем текущее бронирование из проверки конфликтов
			await this.ensureRoomAvailable(finalRoomId, finalCheckIn, finalCheckOut, id);
		}

		// 6. Выполнить обновление и вернуть результат
		const updatedReservation = await this.reservationModel
			.findByIdAndUpdate(
				id,
				{
					$set: {
						...(newRoomId ? { room: new Types.ObjectId(newRoomId) } : {}),
						...(newCheckIn ? { checkInDate: finalCheckIn } : {}),
						...(newCheckOut ? { checkOutDate: finalCheckOut } : {}),
					},
				}, // Явно используем оператор $set
				{
					new: true, // Вернуть обновленный документ
					runValidators: true, // Запустить валидаторы схемы
				},
			)
			.exec();

		if (!updatedReservation) {
			// Эта строка должна быть недостижима после первой проверки, но для безопасности оставим
			throw new NotFoundException(`Reservation with ID ${id} not found after update`);
		}

		return this.toResponseDto(updatedReservation);
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

	// public async getRoomAvailability(
	// 	roomId: string,
	// 	startDate?: Date,
	// 	endDate?: Date,
	// ): Promise<{ available: boolean; conflictingDates?: Date[] }> {
	// 	const normalizedStart = startDate ? this.normalizeDate(new Date(startDate)) : this.normalizeDate(new Date());
	// 	const normalizedEnd = endDate
	// 		? this.normalizeDate(new Date(endDate))
	// 		: new Date(normalizedStart.getTime() + 30 * 24 * 60 * 60 * 1000);

	// 	const conflicts = await this.reservationModel
	// 		.find({
	// 			room: new Types.ObjectId(roomId),
	// 			$or: [
	// 				{
	// 					checkInDate: { $lt: normalizedEnd },
	// 					checkOutDate: { $gt: normalizedStart },
	// 				},
	// 			],
	// 		})
	// 		.sort({ checkInDate: 1 })
	// 		.exec();

	// 	return {
	// 		available: conflicts.length === 0,
	// 		conflictingDates: conflicts.map((res): Date => res.checkInDate),
	// 	};
	// }
}
