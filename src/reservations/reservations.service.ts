import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Reservation, ReservationDocument } from "./reservation.model";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";

@Injectable()
export class ReservationsService {
	public constructor(@InjectModel(Reservation.name) private readonly reservationModel: Model<ReservationDocument>) {}
	public async create(dto: CreateReservationDto): Promise<ReservationDocument> {
		// const instance2 = await this.reservationModel.create([dto], { validateBeforeSave: true });
		const reservationDate = new Date(dto.reservationDate);
		const startOfDay = new Date(
			reservationDate.getFullYear(),
			reservationDate.getMonth(),
			reservationDate.getDate(),
		);
		const endOfDay = new Date(startOfDay);
		endOfDay.setDate(endOfDay.getDate() + 1);

		// Check for existing reservation
		const existing = await this.reservationModel.findOne({
			room: new Types.ObjectId(dto.room),
			reservationDate: {
				$gte: startOfDay,
				$lt: endOfDay,
			},
		});

		if (existing) {
			throw new ConflictException(`Room ${dto.room} is already reserved on ${dto.reservationDate.toString()}`);
		}

		// Create new reservation
		const reservation = new this.reservationModel({
			room: new Types.ObjectId(dto.room),
			reservationDate: reservationDate,
		});
		return reservation.save({ validateBeforeSave: true });

		// 	try {
		//   return await reservation.save();
		// } catch (error) {
		//   if (error.code === 11000) { // MongoDB duplicate key error
		//     throw new ConflictException(
		//       `Room ${dto.room} is already reserved on ${reservationDay}`,
		//     );
		//   }
		//   throw error;
		// }
	}

	public async update(id: string, dto: UpdateReservationDto): Promise<ReservationDocument> {
		// Validate ID format
		if (!Types.ObjectId.isValid(id)) {
			throw new BadRequestException("Invalid reservation ID");
		}
		const objectId = new Types.ObjectId(id);

		// Check for reservationDate if provided in DTO
		if (dto.reservationDate) {
			const reservationDate = new Date(dto.reservationDate);
			const startOfDay = new Date(
				reservationDate.getFullYear(),
				reservationDate.getMonth(),
				reservationDate.getDate(),
			);
			const endOfDay = new Date(startOfDay);
			endOfDay.setDate(endOfDay.getDate() + 1);

			// Check for conflicting reservations, excluding the current one
			const existing = await this.reservationModel.findOne({
				_id: { $ne: objectId }, // Exclude current reservation
				room: new Types.ObjectId(dto.room || (await this.reservationModel.findById(id))?.room),
				reservationDate: { $gte: startOfDay, $lt: endOfDay },
			});

			if (existing) {
				throw new ConflictException(
					`Room ${dto.room || "provided"} is already reserved on ${dto.reservationDate.toString()}`,
				);
			}
		}

		const updatedReservation = await this.reservationModel.findByIdAndUpdate(
			new Types.ObjectId(id),
			{ $set: dto },
			{ new: true, runValidators: true },
		);

		if (!updatedReservation) {
			throw new NotFoundException(`Reservation with ID ${id} not found`);
		}

		return updatedReservation;
	}

	public async delete(id: string): Promise<ReservationDocument | null> {
		const deletedReservation = await this.reservationModel.findByIdAndDelete(new Types.ObjectId(id));
		if (!deletedReservation) {
			throw new NotFoundException(`Reservation with ID ${id} not found`);
		}
		return deletedReservation;
	}

	public async getById(id: string): Promise<ReservationDocument | null> {
		if (!Types.ObjectId.isValid(id)) {
			throw new BadRequestException("Invalid reservation ID");
		}
		const reservation = await this.reservationModel.findById(new Types.ObjectId(id)).populate("room");
		if (!reservation) {
			throw new NotFoundException(`Reservation with ID ${id} not found`);
		}
		return reservation;
	}

	public async getAll(filter: { limit?: number }): Promise<ReservationDocument[]> {
		return this.reservationModel
			.find()
			.populate("room")
			.limit(filter.limit ?? 10)
			.exec();
	}
}
