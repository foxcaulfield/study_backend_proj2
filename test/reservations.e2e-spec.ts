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
import { MongooseModule } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Reservations (e2e)", () => {
	let app: INestApplication;
	let mongoServer: MongoMemoryServer;
	let roomId: string;

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
		await app.init();

		const roomRes = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 201, roomType: "STANDARD_ROOM", hasSeaView: true });
		roomId = roomRes.body.id;
	});

	afterAll(async () => {
		await app.close();
		await mongoServer.stop();
	});

	it("/reservations (POST) - create reservation", async () => {
		const response = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: roomId,
				checkInDate: "2025-01-01",
				checkOutDate: "2025-01-05",
			})
			.expect(201);
		expect(response.body.room).toBe(roomId);
	});

	it("/reservations (POST) - conflict on overlapping dates", async () => {
		await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: roomId,
				checkInDate: "2025-01-03",
				checkOutDate: "2025-01-07",
			})
			.expect(409);
	});

	it("/reservations (POST) - invalid dates", async () => {
		await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: roomId,
				checkInDate: "2025-01-10",
				checkOutDate: "2025-01-05",
			})
			.expect(400);
	});

	it("/reservations (POST) - room not found", async () => {
		await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: "invalidroomid",
				checkInDate: "2025-01-01",
				checkOutDate: "2025-01-05",
			})
			.expect(404);
	});

	it("/reservations (POST) - invalid DTO", async () => {
		await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: "not-mongoid",
				checkInDate: "not-date",
				checkOutDate: "not-date",
			})
			.expect(400);
	});

	it("/reservations (GET) - find all reservations", async () => {
		const response = await request(app.getHttpServer()).get("/reservations").expect(200);
		expect(response.body.length).toBeGreaterThan(0);
	});

	it("/reservations/room/:roomId (GET) - find by room", async () => {
		const response = await request(app.getHttpServer()).get(`/reservations/room/${roomId}`).expect(200);
		expect(response.body.length).toBeGreaterThan(0);
	});

	it("/reservations/:id (GET) - find one reservation", async () => {
		const createRes = await request(app.getHttpServer()).post("/reservations").send({
			room: roomId,
			checkInDate: "2025-02-01",
			checkOutDate: "2025-02-05",
		});
		const id = createRes.body.id;
		await request(app.getHttpServer()).get(`/reservations/${id}`).expect(200);
	});

	it("/reservations/:id (GET) - not found", async () => {
		await request(app.getHttpServer()).get("/reservations/invalidid").expect(404);
	});

	it("/reservations/:id (PATCH) - update reservation", async () => {
		const createRes = await request(app.getHttpServer()).post("/reservations").send({
			room: roomId,
			checkInDate: "2025-03-01",
			checkOutDate: "2025-03-05",
		});
		const id = createRes.body.id;
		await request(app.getHttpServer())
			.patch(`/reservations/${id}`)
			.send({ checkOutDate: "2025-03-07" })
			.expect(200);
	});

	it("/reservations/:id (PATCH) - conflict on new dates", async () => {
		const createRes1 = await request(app.getHttpServer()).post("/reservations").send({
			room: roomId,
			checkInDate: "2025-04-01",
			checkOutDate: "2025-04-05",
		});
		const id1 = createRes1.body.id;
		await request(app.getHttpServer()).post("/reservations").send({
			room: roomId,
			checkInDate: "2025-04-06",
			checkOutDate: "2025-04-10",
		});
		await request(app.getHttpServer())
			.patch(`/reservations/${id1}`)
			.send({ checkOutDate: "2025-04-07" })
			.expect(409);
	});

	it("/reservations/:id (PATCH) - invalid DTO", async () => {
		const createRes = await request(app.getHttpServer()).post("/reservations").send({
			room: roomId,
			checkInDate: "2025-06-01",
			checkOutDate: "2025-06-05",
		});
		const id = createRes.body.id;
		await request(app.getHttpServer())
			.patch(`/reservations/${id}`)
			.send({ room: "not-mongoid", checkInDate: "not-date" })
			.expect(400);
	});

	it("/reservations/:id (PATCH) - not found", async () => {
		await request(app.getHttpServer())
			.patch("/reservations/invalidid")
			.send({ checkOutDate: "2025-03-07" })
			.expect(404);
	});

	it("/reservations/:id (DELETE) - remove reservation", async () => {
		const createRes = await request(app.getHttpServer()).post("/reservations").send({
			room: roomId,
			checkInDate: "2025-05-01",
			checkOutDate: "2025-05-05",
		});
		const id = createRes.body.id;
		await request(app.getHttpServer()).delete(`/reservations/${id}`).expect(200);
	});

	it("/reservations/:id (DELETE) - not found", async () => {
		await request(app.getHttpServer()).delete("/reservations/invalidid").expect(404);
	});
});
