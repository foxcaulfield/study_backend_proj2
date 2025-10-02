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

describe("Rooms (e2e)", () => {
	let app: INestApplication;
	let mongoServer: MongoMemoryServer;

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
	});

	afterAll(async () => {
		await app.close();
		await mongoServer.stop();
	});

	it("/rooms (POST) - create room", async () => {
		const response = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 101, roomType: "STANDARD_ROOM", hasSeaView: true })
			.expect(201);
		expect(response.body.roomNumber).toBe(101);
	});

	it("/rooms (POST) - conflict on duplicate room number", async () => {
		await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 101, roomType: "STANDARD_ROOM", hasSeaView: true })
			.expect(409);
	});

	it("/rooms (POST) - invalid DTO", async () => {
		await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: "not-number", roomType: "INVALID", hasSeaView: "not-bool" })
			.expect(400);
	});

	it("/rooms/get_all (POST) - find all rooms", async () => {
		const response = await request(app.getHttpServer())
			.post("/rooms/get_all")
			.send({ page: 1, limit: 10 })
			.expect(201);
		expect(response.body.rooms.length).toBeGreaterThan(0);
	});

	it("/rooms/available (GET) - find available rooms", async () => {
		const response = await request(app.getHttpServer()).get("/rooms/available").expect(200);
		expect(response.body.rooms).toBeDefined();
	});

	it("/rooms/:id (GET) - find one room", async () => {
		const createRes = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 102, roomType: "DELUXE_ROOM", hasSeaView: false });
		const id = createRes.body.id;
		await request(app.getHttpServer()).get(`/rooms/${id}`).expect(200);
	});

	it("/rooms/:id (GET) - not found", async () => {
		await request(app.getHttpServer()).get("/rooms/invalidid").expect(404);
	});

	it("/rooms/:id (PATCH) - update room", async () => {
		const createRes = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 103, roomType: "STANDARD_ROOM", hasSeaView: true });
		const id = createRes.body.id;
		await request(app.getHttpServer()).patch(`/rooms/${id}`).send({ hasSeaView: false }).expect(200);
	});

	it("/rooms/:id (PATCH) - invalid DTO", async () => {
		const createRes = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 105, roomType: "STANDARD_ROOM", hasSeaView: true });
		const id = createRes.body.id;
		await request(app.getHttpServer())
			.patch(`/rooms/${id}`)
			.send({ roomNumber: "not-number", roomType: "INVALID" })
			.expect(400);
	});

	it("/rooms/:id (PATCH) - not found", async () => {
		await request(app.getHttpServer()).patch("/rooms/invalidid").send({ hasSeaView: false }).expect(404);
	});

	it("/rooms/:id (DELETE) - remove room", async () => {
		const createRes = await request(app.getHttpServer())
			.post("/rooms")
			.send({ roomNumber: 104, roomType: "STANDARD_ROOM", hasSeaView: true });
		const id = createRes.body.id;
		await request(app.getHttpServer()).delete(`/rooms/${id}`).expect(204);
	});

	it("/rooms/:id (DELETE) - not found", async () => {
		await request(app.getHttpServer()).delete("/rooms/invalidid").expect(404);
	});
});
