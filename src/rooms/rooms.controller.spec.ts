/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from "@nestjs/testing";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { FilterRoomDto } from "./dto/filter-room.dto";
import { RoomTypeEnum, RoomStatusEnum } from "./room.model";
import { ResponseRoomDto } from "./dto/response-room.dto";
import { NotFoundException, ConflictException } from "@nestjs/common";

describe("RoomsController", () => {
	let controller: RoomsController;
	let service: RoomsService;

	const mockRoom: ResponseRoomDto = {
		id: "507f1f77bcf86cd799439011",
		roomNumber: 101,
		roomType: RoomTypeEnum.STANDARD_ROOM,
		roomStatus: RoomStatusEnum.AVAILABLE,
		hasSeaView: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const mockPaginatedResponse = {
		rooms: [mockRoom],
		total: 1,
		page: 1,
		limit: 10,
		pages: 1,
	};

	const mockRoomsService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findAvailableRooms: jest.fn(),
		findById: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RoomsController],
			providers: [
				{
					provide: RoomsService,
					useValue: mockRoomsService,
				},
			],
		}).compile();

		controller = module.get<RoomsController>(RoomsController);
		service = module.get<RoomsService>(RoomsService);
		jest.clearAllMocks();
	});

	describe("create", () => {
		it("should create a room successfully", async () => {
			const createRoomDto: CreateRoomDto = {
				roomNumber: 101,
				roomType: RoomTypeEnum.STANDARD_ROOM,
				hasSeaView: true,
			};

			mockRoomsService.create.mockResolvedValue(mockRoom);

			const result = await controller.create(createRoomDto);

			expect(service.create).toHaveBeenCalledWith(createRoomDto);
			expect(result).toEqual(mockRoom);
		});

		it("should throw ConflictException when room number already exists", async () => {
			const createRoomDto: CreateRoomDto = {
				roomNumber: 101,
				roomType: RoomTypeEnum.STANDARD_ROOM,
			};

			mockRoomsService.create.mockRejectedValue(new ConflictException("Room with number 101 already exists"));

			await expect(controller.create(createRoomDto)).rejects.toThrow(ConflictException);
		});
	});

	describe("findAll", () => {
		it("should return paginated rooms", async () => {
			const filterDto: FilterRoomDto = {
				page: 1,
				limit: 10,
				roomType: RoomTypeEnum.STANDARD_ROOM,
			};

			mockRoomsService.findAll.mockResolvedValue(mockPaginatedResponse);

			const result = await controller.findAll(filterDto);

			expect(service.findAll).toHaveBeenCalledWith(filterDto);
			expect(result).toEqual(mockPaginatedResponse);
			expect(result.rooms).toHaveLength(1);
		});

		it("should return all rooms when no filters provided", async () => {
			const filterDto: FilterRoomDto = {};

			mockRoomsService.findAll.mockResolvedValue(mockPaginatedResponse);

			const result = await controller.findAll(filterDto);

			expect(service.findAll).toHaveBeenCalledWith(filterDto);
			expect(result.total).toBe(1);
		});
	});

	describe("findAvailable", () => {
		it("should return available rooms", async () => {
			mockRoomsService.findAvailableRooms.mockResolvedValue(mockPaginatedResponse);

			const result = await controller.findAvailable();

			expect(service.findAvailableRooms).toHaveBeenCalled();
			expect(result.rooms[0]?.roomStatus).toBe(RoomStatusEnum.AVAILABLE);
		});
	});

	describe("findOne", () => {
		it("should return a room by id", async () => {
			const roomId = "507f1f77bcf86cd799439011";

			mockRoomsService.findById.mockResolvedValue(mockRoom);

			const result = await controller.findOne(roomId);

			expect(service.findById).toHaveBeenCalledWith(roomId);
			expect(result).toEqual(mockRoom);
		});

		it("should throw NotFoundException when room not found", async () => {
			const roomId = "invalid-id";

			mockRoomsService.findById.mockRejectedValue(new NotFoundException(`Room with ID ${roomId} not found`));

			await expect(controller.findOne(roomId)).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		it("should update a room successfully", async () => {
			const roomId = "507f1f77bcf86cd799439011";
			const updateRoomDto: UpdateRoomDto = {
				roomNumber: 102,
				hasSeaView: false,
			};

			const updatedRoom = { ...mockRoom, ...updateRoomDto };
			mockRoomsService.update.mockResolvedValue(updatedRoom);

			const result = await controller.update(roomId, updateRoomDto);

			expect(service.update).toHaveBeenCalledWith(roomId, updateRoomDto);
			expect(result.roomNumber).toBe(102);
			expect(result.hasSeaView).toBe(false);
		});

		it("should throw NotFoundException when updating non-existent room", async () => {
			const roomId = "non-existent-id";
			const updateRoomDto: UpdateRoomDto = { roomNumber: 102 };

			mockRoomsService.update.mockRejectedValue(new NotFoundException(`Room with ID ${roomId} not found`));

			await expect(controller.update(roomId, updateRoomDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("remove", () => {
		it("should delete a room successfully", async () => {
			const roomId = "507f1f77bcf86cd799439011";

			mockRoomsService.remove.mockResolvedValue(undefined);

			await controller.remove(roomId);

			expect(service.remove).toHaveBeenCalledWith(roomId);
		});

		it("should throw NotFoundException when deleting non-existent room", async () => {
			const roomId = "non-existent-id";

			mockRoomsService.remove.mockRejectedValue(new NotFoundException(`Room with ID ${roomId} not found`));

			await expect(controller.remove(roomId)).rejects.toThrow(NotFoundException);
		});
	});
});
