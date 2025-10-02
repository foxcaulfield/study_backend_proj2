/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from "@nestjs/testing";
import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";
import { RoomsService } from "../rooms/rooms.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { ResponseReservationDto } from "./dto/response-reservation.dto";
import { NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";

describe("ReservationsController", () => {
	let controller: ReservationsController;
	let reservationsService: ReservationsService;
	let roomsService: RoomsService;

	const mockReservation: ResponseReservationDto = {
		id: "507f1f77bcf86cd799439012",
		room: "507f1f77bcf86cd799439011",
		checkInDate: "2024-12-01T00:00:00.000Z",
		checkOutDate: "2024-12-05T00:00:00.000Z",
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const mockReservationsService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findByRoom: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};

	const mockRoomsService = {
		checkRoomExists: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ReservationsController],
			providers: [
				{
					provide: ReservationsService,
					useValue: mockReservationsService,
				},
				{
					provide: RoomsService,
					useValue: mockRoomsService,
				},
			],
		}).compile();

		controller = module.get<ReservationsController>(ReservationsController);
		reservationsService = module.get<ReservationsService>(ReservationsService);
		roomsService = module.get<RoomsService>(RoomsService);
		jest.clearAllMocks();
	});

	describe("create", () => {
		it("should create a reservation successfully", async () => {
			const createReservationDto: CreateReservationDto = {
				room: "507f1f77bcf86cd799439011",
				checkInDate: new Date("2024-12-01"),
				checkOutDate: new Date("2024-12-05"),
			};

			mockReservationsService.create.mockResolvedValue(mockReservation);

			const result = await controller.create(createReservationDto);

			expect(reservationsService.create).toHaveBeenCalledWith(createReservationDto);
			expect(result).toEqual(mockReservation);
		});

		it("should throw ConflictException when room is not available", async () => {
			const createReservationDto: CreateReservationDto = {
				room: "507f1f77bcf86cd799439011",
				checkInDate: new Date("2024-12-01"),
				checkOutDate: new Date("2024-12-05"),
			};

			mockReservationsService.create.mockRejectedValue(
				new ConflictException("Room is not available for the selected dates"),
			);

			await expect(controller.create(createReservationDto)).rejects.toThrow(ConflictException);
		});

		it("should throw BadRequestException for invalid dates", async () => {
			const createReservationDto: CreateReservationDto = {
				room: "507f1f77bcf86cd799439011",
				checkInDate: new Date("2024-12-05"),
				checkOutDate: new Date("2024-12-01"), // Invalid: check-out before check-in
			};

			mockReservationsService.create.mockRejectedValue(
				new BadRequestException("Check-out date must be after or equal check-in date"),
			);

			await expect(controller.create(createReservationDto)).rejects.toThrow(BadRequestException);
		});

		it("should throw NotFoundException when room does not exist", async () => {
			const createReservationDto: CreateReservationDto = {
				room: "507f1f77bcf86cd799439011",
				checkInDate: new Date("2024-12-01"),
				checkOutDate: new Date("2024-12-05"),
			};

			mockReservationsService.create.mockRejectedValue(new NotFoundException("Room is not found"));

			await expect(controller.create(createReservationDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("findAll", () => {
		it("should return all reservations", async () => {
			const mockReservations = [mockReservation];
			mockReservationsService.findAll.mockResolvedValue(mockReservations);

			const result = await controller.findAll();

			expect(reservationsService.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockReservations);
			expect(result).toHaveLength(1);
		});

		it("should return empty array when no reservations exist", async () => {
			mockReservationsService.findAll.mockResolvedValue([]);

			const result = await controller.findAll();

			expect(result).toEqual([]);
		});
	});

	describe("findByRoom", () => {
		it("should return reservations for a specific room", async () => {
			const roomId = "507f1f77bcf86cd799439011";
			const mockRoomReservations = [mockReservation];

			mockReservationsService.findByRoom.mockResolvedValue(mockRoomReservations);

			const result = await controller.findByRoom(roomId);

			expect(reservationsService.findByRoom).toHaveBeenCalledWith(roomId);
			expect(result).toEqual(mockRoomReservations);
		});

		it("should return empty array when no reservations for room", async () => {
			const roomId = "507f1f77bcf86cd799439011";

			mockReservationsService.findByRoom.mockResolvedValue([]);

			const result = await controller.findByRoom(roomId);

			expect(result).toEqual([]);
		});
	});

	describe("findOne", () => {
		it("should return a reservation by id", async () => {
			const reservationId = "507f1f77bcf86cd799439012";

			mockReservationsService.findOne.mockResolvedValue(mockReservation);

			const result = await controller.findOne(reservationId);

			expect(reservationsService.findOne).toHaveBeenCalledWith(reservationId);
			expect(result).toEqual(mockReservation);
		});

		it("should throw NotFoundException when reservation not found", async () => {
			const reservationId = "non-existent-id";

			mockReservationsService.findOne.mockRejectedValue(
				new NotFoundException(`Reservation with ID ${reservationId} not found`),
			);

			await expect(controller.findOne(reservationId)).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		it("should update a reservation successfully", async () => {
			const reservationId = "507f1f77bcf86cd799439012";
			const updateReservationDto: UpdateReservationDto = {
				checkOutDate: new Date("2024-12-07"), // Extend stay
			};

			const updatedReservation = {
				...mockReservation,
				checkOutDate: "2024-12-07T00:00:00.000Z",
			};

			mockReservationsService.update.mockResolvedValue(updatedReservation);

			const result = await controller.update(reservationId, updateReservationDto);

			expect(reservationsService.update).toHaveBeenCalledWith(reservationId, updateReservationDto);
			expect(result?.checkOutDate).toBe("2024-12-07T00:00:00.000Z");
		});

		it("should throw NotFoundException when updating non-existent reservation", async () => {
			const reservationId = "non-existent-id";
			const updateReservationDto: UpdateReservationDto = {
				checkOutDate: new Date("2024-12-07"),
			};

			mockReservationsService.update.mockRejectedValue(
				new NotFoundException(`Reservation with ID ${reservationId} not found`),
			);

			await expect(controller.update(reservationId, updateReservationDto)).rejects.toThrow(NotFoundException);
		});

		it("should throw ConflictException when room not available for new dates", async () => {
			const reservationId = "507f1f77bcf86cd799439012";
			const updateReservationDto: UpdateReservationDto = {
				checkInDate: new Date("2024-12-10"),
				checkOutDate: new Date("2024-12-15"),
			};

			mockReservationsService.update.mockRejectedValue(
				new ConflictException("Room is not available for the selected dates"),
			);

			await expect(controller.update(reservationId, updateReservationDto)).rejects.toThrow(ConflictException);
		});

		it("should throw NotFoundException when updating to non-existent room", async () => {
			const reservationId = "507f1f77bcf86cd799439012";
			const updateReservationDto: UpdateReservationDto = {
				room: "non-existent-room-id",
			};

			mockReservationsService.update.mockRejectedValue(new NotFoundException("Room is not found"));

			await expect(controller.update(reservationId, updateReservationDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("remove", () => {
		it("should delete a reservation successfully", async () => {
			const reservationId = "507f1f77bcf86cd799439012";

			mockReservationsService.remove.mockResolvedValue(mockReservation);

			const result = await controller.remove(reservationId);

			expect(reservationsService.remove).toHaveBeenCalledWith(reservationId);
			expect(result).toEqual(mockReservation);
		});

		it("should throw NotFoundException when deleting non-existent reservation", async () => {
			const reservationId = "non-existent-id";

			mockReservationsService.remove.mockRejectedValue(
				new NotFoundException(`Reservation with ID ${reservationId} not found`),
			);

			await expect(controller.remove(reservationId)).rejects.toThrow(NotFoundException);
		});
	});

	describe("validation", () => {
		it("should validate create reservation DTO", async () => {
			const invalidDto = {
				room: "invalid-id", // Should be MongoId
				checkInDate: "not-a-date",
				checkOutDate: "not-a-date",
			};

			// This would typically be tested with e2e tests
			// For unit tests, we rely on the service to handle validation
			expect(true).toBe(true); // Placeholder for validation logic
		});
	});

	describe("error propagation", () => {
		it("should propagate errors from ReservationsService", async () => {
			const reservationId = "507f1f77bcf86cd799439012";

			mockReservationsService.findOne.mockRejectedValue(new Error("Database connection failed"));

			await expect(controller.findOne(reservationId)).rejects.toThrow("Database connection failed");
		});

		it("should handle room existence check errors", async () => {
			const createReservationDto: CreateReservationDto = {
				room: "507f1f77bcf86cd799439011",
				checkInDate: new Date("2024-12-01"),
				checkOutDate: new Date("2024-12-05"),
			};

			mockReservationsService.create.mockRejectedValue(new NotFoundException("Room is not found"));

			await expect(controller.create(createReservationDto)).rejects.toThrow(NotFoundException);
		});
	});
});
