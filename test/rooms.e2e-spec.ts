/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";

describe("RoomsController (e2e)", () => {
	let app: INestApplication;
	let connection: Connection;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		connection = moduleFixture.get<Connection>(getConnectionToken());
		await app.init();
	});

	beforeEach(async () => {
		// Clean database before each test
		await connection.db?.dropDatabase();
	});

	afterAll(async () => {
		await app.close();
	});

	describe("/rooms (POST)", () => {
		it("should create a room", async () => {
			const createRoomDto = {
				roomNumber: 101,
				roomType: "STANDARD_ROOM",
				hasSeaView: true,
			};

			const response = await request(app.getHttpServer()).post("/rooms").send(createRoomDto).expect(201);

			expect(response.body).toHaveProperty("id");
			expect(response.body.roomNumber).toBe(101);
			expect(response.body.roomType).toBe("STANDARD_ROOM");
		});

		it("should return 409 when room number already exists", async () => {
			const createRoomDto = {
				roomNumber: 101,
				roomType: "STANDARD_ROOM",
			};

			// Create first room
			await request(app.getHttpServer()).post("/rooms").send(createRoomDto).expect(201);

			// Try to create duplicate
			const response = await request(app.getHttpServer()).post("/rooms").send(createRoomDto).expect(409);

			expect(response.body.message).toContain("already exists");
		});
	});

	describe("/rooms/get_all (POST)", () => {
		it("should return all rooms with pagination", async () => {
			// Create test rooms
			await request(app.getHttpServer()).post("/rooms").send({ roomNumber: 101, roomType: "STANDARD_ROOM" });

			await request(app.getHttpServer()).post("/rooms").send({ roomNumber: 102, roomType: "DELUXE_ROOM" });

			const response = await request(app.getHttpServer())
				.post("/rooms/get_all")
				.send({ page: 1, limit: 10 })
				.expect(201);

			expect(response.body.rooms).toHaveLength(2);
			expect(response.body.total).toBe(2);
		});
	});

	// ... больше E2E тестов
});
