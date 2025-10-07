import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument, type UserModelType } from "./user.model";
import { CreateUserDto } from "./dto/create-user.dto";
import { ResponseUserDto } from "./dto/response-user.dto";
// import { plainToInstance } from "class-transformer";
import * as bcrypt from "bcrypt";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
	private toResponseDto(entity: UserDocument): ResponseUserDto;
	private toResponseDto(entity: UserDocument[]): ResponseUserDto[];
	private toResponseDto(entity: UserDocument | UserDocument[]): ResponseUserDto | ResponseUserDto[] {
		if (Array.isArray(entity)) {
			return entity.map((user): ResponseUserDto => this.convertToResponseDto(user));
		}
		return this.convertToResponseDto(entity);
	}

	private convertToResponseDto(user: UserDocument): ResponseUserDto {
		return {
			id: user._id.toString(),
			email: user.email,
			fullname: user.fullname,
			phone: user.phone,
			role: user.role,
		};
	}

	public constructor(@InjectModel(User.name) private readonly userModel: UserModelType) {}
	public async createUser(dto: CreateUserDto): Promise<ResponseUserDto> {
		const { email, password, ...rest } = dto;

		const existingUser = await this.userModel.findOne({ email });

		if (existingUser) {
			throw new ConflictException("User with this email already exists");
		}

		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		// const createdUser = await this.userModel.create(dto);
		const createdUser = new this.userModel({
			email,
			passwordHash,
			...rest,
		});

		await createdUser.save();

		return this.toResponseDto(createdUser);
	}

	/* Admin */
	public async findByEmail(email: string): Promise<UserDocument> {
		const foundUser = await this.userModel.findOne({ email });

		if (!foundUser) {
			throw new NotFoundException();
		}

		return foundUser;
	}

	public async findById(id: string): Promise<ResponseUserDto> {
		console.log("UsersService, method findById, id:", id);
		const foundUser = await this.userModel.findById(id);

		if (!foundUser) {
			throw new NotFoundException();
		}

		return this.toResponseDto(foundUser);
	}

	public async validatePassword(userPasswordHash: string, incomingPassword: string): Promise<boolean> {
		return await bcrypt.compare(incomingPassword, userPasswordHash);
	}

	public async update(id: string, dto: UpdateUserDto): Promise<ResponseUserDto> {
		const user = await this.userModel.findByIdAndUpdate(id, dto, { new: true });

		if (!user) {
			throw new NotFoundException("User not found");
		}

		return this.toResponseDto(user);
	}

	public async findAll(limit?: number): Promise<ResponseUserDto[]> {
		const query = this.userModel.find();
		if (limit) {
			query.limit(limit);
		}

		const result = await query.exec();

		return this.toResponseDto(result);
	}
}
