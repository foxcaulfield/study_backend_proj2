/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ReservationModelType } from "src/reservations/reservation.model";
import { RoomModelType, RoomStatusEnum, RoomTypeEnum } from "src/rooms/room.model";
import { AllExceptionsFilter } from "src/filters/all-exception.filter";

describe("Rooms (e2e)", () => {
	let app: INestApplication;
	let mongoServer: MongoMemoryServer;
	let reservationModel: ReservationModelType;
	let roomModel: RoomModelType;

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				MongooseModule.forRootAsync({
					useFactory: () => ({ uri: mongoUri }),
				}),
				AppModule,
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalFilters(new AllExceptionsFilter());

		await app.init();

		roomModel = moduleFixture.get<RoomModelType>(getModelToken("Room"));
		reservationModel = moduleFixture.get<ReservationModelType>(getModelToken("Reservation"));
	});

	afterAll(async () => {
		await app.close();
		await mongoServer.stop();
	});

	afterEach(async (): Promise<void> => {
		await reservationModel.deleteMany({});
		await roomModel.deleteMany({});
	});

	it("/rooms (POST) - should create room", async () => {
		const response = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 101, roomType: RoomTypeEnum.STANDARD_ROOM, hasSeaView: true })
			.expect(201);
		expect(response.body.roomNumber).toBe(101);
	});

	it("/rooms (POST) - shloud conflict on duplicate room number", async () => {
		await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 101, roomType: RoomTypeEnum.STANDARD_ROOM, hasSeaView: true })
			.expect(201);

		await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 101, roomType: RoomTypeEnum.STANDARD_ROOM, hasSeaView: true })
			.expect(409);
	});

	it("/rooms (POST) - should fail on create room (invalid room type)", async () => {
		const response = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 101, roomType: "SUITdE", hasSeaView: true })
			.expect(500);
		expect(response.body.message).toContain("Room validation failed");
	});

	it("/rooms (POST) - should fail on create room (invalid room number +)", async () => {
		const response = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 5000, roomType: "SUITdE", hasSeaView: true })
			.expect(500);
		expect(response.body.message).toContain("Room validation failed");
	});
	it("/rooms (POST) - should fail on create room (invalid room number -)", async () => {
		const response = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: -1, roomType: "SUITdE", hasSeaView: true })
			.expect(500);
		expect(response.body.message).toContain("Room validation failed");
	});

	it("/rooms (POST) - invalid DTO", async () => {
		await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: "not-number", roomType: "INVALID", hasSeaView: "not-bool" })
			.expect(500);
	});

	it("/rooms/get_all (POST) - find all rooms", async () => {
		await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 101, roomType: RoomTypeEnum.STANDARD_ROOM, hasSeaView: true })
			.expect(201);
		await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 102, roomType: RoomTypeEnum.STANDARD_ROOM, hasSeaView: true })
			.expect(201);

		const response = await request(app.getHttpServer())
			.post("/rooms/get_all")
			.send({ page: 1, limit: 10 })
			.expect(201);
		expect(response.body.rooms.length).toBeGreaterThan(0);
	});

	it("/rooms/available (GET) - find available rooms (zero)", async () => {
		const response = await request(app.getHttpServer()).get("/rooms/available").expect(200);
		expect(response.body.rooms).toBeDefined();
		expect(response.body.rooms.length).toBe(0); /* because nothing was created */
	});
	it("/rooms/available (GET) - find available rooms (one)", async () => {
		const room = await roomModel.create({
			roomNumber: 500,
			roomStatus: RoomStatusEnum.AVAILABLE,
			roomType: RoomTypeEnum.DELUXE_ROOM,
		});
		expect(room.roomNumber).toBe(500);
		const response = await request(app.getHttpServer()).get("/rooms/available").expect(200);
		expect(response.body.rooms).toBeDefined();
		expect(response.body.rooms.length).toBe(1); /* because nothing was created */
	});

	it("/rooms/:id (GET) - find one room by id", async () => {
		// const createRes = await request(app.getHttpServer())
		// 	.post("/rooms")
		// 	.send({ roomNumber: 102, roomType: "DELUXE_ROOM", hasSeaView: false });
		// const id = createRes.body.id;
		const room = await roomModel.create({
			roomNumber: 500,
			roomStatus: RoomStatusEnum.AVAILABLE,
			roomType: RoomTypeEnum.DELUXE_ROOM,
		});
		expect(room.roomNumber).toBe(500);
		await request(app.getHttpServer()).get(`/rooms/${room.id}`).expect(200);
	});

	it("/rooms/:id (GET) - should not found", async () => {
		await request(app.getHttpServer()).get("/rooms/68de9d0d7d23827ba2c172e6").expect(404);
	});

	it("/rooms/:id (PATCH) - update room", async () => {
		const room = await roomModel.create({
			roomNumber: 500,
			roomStatus: RoomStatusEnum.AVAILABLE,
			roomType: RoomTypeEnum.DELUXE_ROOM,
			hasSeaView: true,
		});
		expect(room.roomNumber).toBe(500);
		await request(app.getHttpServer()).patch(`/rooms/${room.id}`).send({ hasSeaView: false }).expect(200);
	});

	it("/rooms/:id (PATCH) - invalid DTO", async () => {
		const room = await roomModel.create({
			roomNumber: 500,
			roomStatus: RoomStatusEnum.AVAILABLE,
			roomType: RoomTypeEnum.DELUXE_ROOM,
			hasSeaView: true,
		});
		expect(room.roomNumber).toBe(500);
		await request(app.getHttpServer())
			.patch(`/rooms/${room.id}`)
			.send({ roomNumber: "not-number", roomType: "INVALID" })
			.expect(500);
	});

	it("/rooms/:id (PATCH) - not found", async () => {
		await request(app.getHttpServer())
			.patch("/rooms/68de9d0d7d23827ba2c172e6")
			.send({ hasSeaView: false })
			.expect(404);
	});

	it("/rooms/:id (DELETE) - remove room", async () => {
		const room = await roomModel.create({
			roomNumber: 500,
			roomStatus: RoomStatusEnum.AVAILABLE,
			roomType: RoomTypeEnum.DELUXE_ROOM,
			hasSeaView: true,
		});
		expect(room.roomNumber).toBe(500);
		await request(app.getHttpServer()).delete(`/rooms/${room.id}`).expect(204);
	});

	it("/rooms/:id (DELETE) - not found", async () => {
		await request(app.getHttpServer()).delete("/rooms/68de9d0d7d23827ba2c172e6").expect(404);
	});
});
