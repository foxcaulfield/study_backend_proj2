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

describe("ReservationsController (e2e)", () => {
	let app: INestApplication;
	let connection: Connection;
	let roomId: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		connection = moduleFixture.get<Connection>(getConnectionToken());
		await app.init();

		// Create a test room
		const roomResponse = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 101, roomType: "STANDARD_ROOM" });

		roomId = roomResponse.body.id;
	});

	beforeEach(async () => {
		await connection.db?.dropDatabase();
	});

	afterAll(async () => {
		await app.close();
	});

	describe("/reservations (POST)", () => {
		it("should create a reservation", async () => {
			const createReservationDto = {
				room: roomId,
				checkInDate: "2024-12-01",
				checkOutDate: "2024-12-05",
			};

			const response = await request(app.getHttpServer())
				.post("/reservations")
				.send(createReservationDto)
				.expect(201);

			expect(response.body).toHaveProperty("id");
			expect(response.body.room).toBe(roomId);
		});

		it("should return 409 when room is not available", async () => {
			const createReservationDto = {
				room: roomId,
				checkInDate: "2024-12-01",
				checkOutDate: "2024-12-05",
			};

			// Create first reservation
			await request(app.getHttpServer()).post("/reservations").send(createReservationDto).expect(201);

			// Try to create overlapping reservation
			const response = await request(app.getHttpServer())
				.post("/reservations")
				.send(createReservationDto)
				.expect(409);

			expect(response.body.message).toContain("not available");
		});
	});

	// ... больше E2E тестов
});
