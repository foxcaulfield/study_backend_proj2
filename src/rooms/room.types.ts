import { ResponseRoomDto } from "./dto/response-room.dto";

export type PaginatedResponse = {
	rooms: ResponseRoomDto[];
	total: number;
	page: number;
	limit: number;
	pages: number;
};
