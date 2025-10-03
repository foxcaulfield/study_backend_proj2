/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AllExceptionsFilter } from "src/filters/all-exception.filter";
import { Connection, Model } from "mongoose";
import { Room, RoomModelType, RoomTypeEnum } from "src/rooms/room.model";
import { CreateRoomDto } from "src/rooms/dto/create-room.dto";
import { ResponseRoomDto } from "src/rooms/dto/response-room.dto";
import { getModelToken } from "@nestjs/mongoose";
import { Reservation, ReservationDocument, ReservationModelType } from "src/reservations/reservation.model";

function getRelativeDate(daysFromToday: number): Date {
	const date = new Date();
	date.setDate(date.getDate() + daysFromToday);
	return date;
	// date.setHours(0, 0, 0, 0);
	// return date.toISOString().split("T")[0]!;
}

export class RoomHelpers {
	public constructor(private readonly app: INestApplication) {}

	private defaultRoom() {
		return {
			// roomNumber: 200 + Math.floor(Math.random() * 100),
			roomNumber: 200,
			roomType: RoomTypeEnum.STUDIO_ROOM,
			hasSeaView: true,
			// ...roomData,
		};
	}

	public async createDefaultRoom(): Promise<ResponseRoomDto> {
		const defaultRoom = this.defaultRoom();

		const roomRes = await request(this.app.getHttpServer()).post("/rooms").send(defaultRoom).expect(201);

		return roomRes.body as ResponseRoomDto;
	}

	public async deleteRoom(roomId: string): Promise<void> {
		if (!roomId) return;

		try {
			await request(this.app.getHttpServer()).delete(`/rooms/${roomId}`).expect(204);
		} catch (error) {
			console.log(`Room ${roomId} already deleted or not found`);
		}
	}
}

// interface ReservationScenario {
// 	checkInDateOffset: number;
// 	checkOutDateOffset: number;
// 	expectedStatusCode: number;
// 	description: string;
// 	expectedMessage?: string;
// }

class ReservationTestUnit {
	public checkInDateOffset: number;
	public checkOutDateOffset: number;
	public expectedStatusCode: number;
	public description: string;
	public expectedMessage?: string;

	public constructor(rangeOffset: { from: number; to: number }, statusCode: number, desc: string, message?: string) {
		this.checkInDateOffset = rangeOffset.from;
		this.checkOutDateOffset = rangeOffset.to;
		this.expectedStatusCode = statusCode;
		this.description = desc;
		if (message) this.expectedMessage = message;
	}
}

describe("Reservations (e2e)", () => {
	let app: INestApplication;
	let mongoServer: MongoMemoryServer;
	let roomHelpers: RoomHelpers;
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

		roomHelpers = new RoomHelpers(app);
		roomModel = moduleFixture.get<RoomModelType>(getModelToken("Room"));
		reservationModel = moduleFixture.get<ReservationModelType>(getModelToken("Reservation"));
		// reservationModel.find();
	});

	beforeEach(async () => {});

	afterEach(async (): Promise<void> => {
		await reservationModel.deleteMany({});
		await roomModel.deleteMany({});
	});

	afterAll(async () => {
		await app.close();
		await mongoServer.stop();
	});

	describe("/reservations (POST) create scenarios", () => {
		const testScenarios: ReservationTestUnit[] = [
			// Valid scenarios
			new ReservationTestUnit({ from: 0, to: 0 }, 201, "today, same day"),
			new ReservationTestUnit({ from: 1, to: 1 }, 201, "tomorrow, same day"),
			new ReservationTestUnit({ from: 0, to: 3 }, 201, "today, +3 days"),
			new ReservationTestUnit({ from: 1, to: 4 }, 201, "tomorrow, +3 days"),

			// Invalid scenarios
			new ReservationTestUnit(
				{ from: -1, to: -1 },
				500,
				"should NOT - yesterday, same day",
				"checkInDate: Date can't be in the past, checkOutDate: Date can't be in the past",
			),
			new ReservationTestUnit(
				{ from: -1, to: 2 },
				500,
				"should NOT - yesterday, +3 days",
				"checkInDate: Date can't be in the past",
			),
			new ReservationTestUnit(
				{ from: -4, to: -1 },
				500,
				"should NOT - 4 days ago, yesterday",
				"checkInDate: Date can't be in the past, checkOutDate: Date can't be in the past",
			),
			new ReservationTestUnit(
				{ from: 20, to: 3 },
				400,
				"should NOT - invalid check-it date",
				"Check-out date must be after or equal check-in date",
			),
		];

		testScenarios.forEach(
			({ checkInDateOffset, checkOutDateOffset, expectedStatusCode, description, expectedMessage }) => {
				it(description, async () => {
					const defaultRoom = await roomHelpers.createDefaultRoom();

					try {
						const response = await request(app.getHttpServer())
							.post("/reservations")
							.send({
								room: defaultRoom.id,
								checkInDate: getRelativeDate(checkInDateOffset),
								checkOutDate: getRelativeDate(checkOutDateOffset),
							})
							.expect(expectedStatusCode);

						if (expectedStatusCode === 201) {
							expect(response.body.room).toBe(defaultRoom.id);
						} else if (expectedMessage) {
							expect(response.body.message).toContain(expectedMessage);
						}
					} finally {
						await roomHelpers.deleteRoom(defaultRoom.id);
					}
				});
			},
		);
	});

	it("/reservations (POST) - room should NOT be found (non-exist id)", async () => {
		const date1 = getRelativeDate(+1);
		const date2 = getRelativeDate(+3);

		const response = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: "68de9d0d7d23827ba2c172e5" /* not exist */,
				checkInDate: date1,
				checkOutDate: date2,
			})
			.expect(404);

		expect(response.body.message).toContain("Room is not found");
	});

	it("/reservations (POST) - room should NOT be found (invalid id)", async () => {
		const date1 = getRelativeDate(+1);
		const date2 = getRelativeDate(+3);

		const response = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: "qwe" /* not valid */,
				checkInDate: date1,
				checkOutDate: date2,
			})
			.expect(400);

		expect(response.body.message).toContain("room must be a mongodb id");
	});

	it("/reservations (POST) - should NOT create (invalid DTO)", async () => {
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
		const defaultRoom = await roomHelpers.createDefaultRoom();
		const responseFirst = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: defaultRoom.id,
				checkInDate: getRelativeDate(0),
				checkOutDate: getRelativeDate(0),
			})
			.expect(201);

		const responseSecond = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: defaultRoom.id,
				checkInDate: getRelativeDate(1),
				checkOutDate: getRelativeDate(1),
			})
			.expect(201);

		const response = await request(app.getHttpServer()).get("/reservations").expect(200);
		expect(response.body.length).toBeGreaterThan(0);
		await roomHelpers.deleteRoom(defaultRoom.id);
	});

	it("/reservations/room/:roomId (GET) - find by room", async () => {
		const defaultRoom = await roomHelpers.createDefaultRoom();

		const reservationResponse = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: defaultRoom.id,
				checkInDate: getRelativeDate(0),
				checkOutDate: getRelativeDate(0),
			})
			.expect(201);

		const response = await request(app.getHttpServer()).get(`/reservations/room/${defaultRoom.id}`).expect(200);
		expect(response.body.length).toBeGreaterThan(0);
	});

	it("/reservations/:id (GET) - find one reservation", async () => {
		const defaultRoom = await roomHelpers.createDefaultRoom();

		const reservationResponse = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: defaultRoom.id,
				checkInDate: getRelativeDate(0),
				checkOutDate: getRelativeDate(0),
			})
			.expect(201);
		const id = reservationResponse.body.id;
		await request(app.getHttpServer()).get(`/reservations/${id}`).expect(200);
	});

	it("/reservations/:id (GET) - not found", async () => {
		await request(app.getHttpServer()).get("/reservations/68de3e710fefd1f567b5a253").expect(404);
	});

	it("/reservations/:id (PATCH) - update reservation", async () => {
		const defaultRoom = await roomHelpers.createDefaultRoom();

		const createRes = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: defaultRoom.id,
				checkInDate: getRelativeDate(0),
				checkOutDate: getRelativeDate(4),
			});
		const id = createRes.body.id;

		await request(app.getHttpServer())
			.patch(`/reservations/${id}`)
			.send({ checkOutDate: getRelativeDate(5) })
			.expect(200);
	});

	it("/reservations/:id (PATCH) - conflict on new dates", async () => {
		const defaultRoom = await roomHelpers.createDefaultRoom();

		const createRes1 = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: defaultRoom.id,
				checkInDate: getRelativeDate(1),
				checkOutDate: getRelativeDate(5),
			});
		const id1 = createRes1.body.id;

		const createRes2 = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: defaultRoom.id,
				checkInDate: getRelativeDate(6),
				checkOutDate: getRelativeDate(10),
			});
		await request(app.getHttpServer())
			.patch(`/reservations/${id1}`)
			.send({ checkOutDate: getRelativeDate(8) })
			.expect(409);
	});

	it("/reservations/:id (PATCH) - invalid DTO", async () => {
		const defaultRoom = await roomHelpers.createDefaultRoom();

		const createRes = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: defaultRoom.id,
				checkInDate: getRelativeDate(1),
				checkOutDate: getRelativeDate(5),
			});
		const id = createRes.body.id;
		await request(app.getHttpServer())
			.patch(`/reservations/${id}`)
			.send({ room: "not-mongoid", checkInDate: "not-date" })
			.expect(400);
	});

	it("/reservations/:id (PATCH) - not found", async () => {
		await request(app.getHttpServer())
			.patch("/reservations/68de3e710fefd1f567b5a253")
			.send({ checkOutDate: getRelativeDate(10) })
			.expect(404);
	});

	it("/reservations/:id (DELETE) - remove reservation", async () => {
		const defaultRoom = await roomHelpers.createDefaultRoom();

		const createRes = await request(app.getHttpServer())
			.post("/reservations")
			.send({
				room: defaultRoom.id,
				checkInDate: getRelativeDate(1),
				checkOutDate: getRelativeDate(5),
			});
		const id = createRes.body.id;
		await request(app.getHttpServer()).delete(`/reservations/${id}`).expect(200);
	});

	it("/reservations/:id (DELETE) - not found", async () => {
		await request(app.getHttpServer()).delete("/reservations/68de3e710fefd1f567b5a253").expect(404);
	});
});
