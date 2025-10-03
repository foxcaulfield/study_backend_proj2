/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	public catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = "Internal server error";
		let errors: any[] = [];

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === "string") {
				message = exceptionResponse;
			} else if (typeof exceptionResponse === "object") {
				const responseObj = exceptionResponse as any;
				message = responseObj?.message || message;
				errors = responseObj?.errors || [];
			}
		} else if (exception instanceof Error) {
			message = exception.message;
		}

		response.status(status).json({
			statusCode: status,
			message,
			errors,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
