import { Max, Min, IsInt, IsPositive, IsNumber, IsOptional } from "class-validator";

export class FilterUserDto {
	@Max(100)
	@Min(1)
	@IsInt()
	@IsPositive()
	@IsNumber()
	@IsOptional()
	public limit?: number = 10;
}
