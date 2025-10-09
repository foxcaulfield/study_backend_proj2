import { Controller, HttpCode, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { UploadedFile } from "./uploaded-file.interface";
import { FilesService } from "./files.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { FilesInterceptor } from "@nestjs/platform-express";
// import { type Response } from "express";
// import path from "path";
// import fs from "fs";

@Controller("files")
export class FilesController {
	public constructor(private readonly filesService: FilesService) {}

	@Post("upload")
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FilesInterceptor("files"))
	public async upload(@UploadedFiles() files: Array<Express.Multer.File>): Promise<UploadedFile[]> {
		return await this.filesService.uploadFiles(files);
	}
}

// ALTERNATIVE: Protected file serving example

// @Controller("protected-files")
// export class ProtectedFilesController {
// 	@UseGuards(JwtAuthGuard)
// 	@Get(":year/:month/:day/:filename")
// 	public getFile(
// 		@Param("year") year: string,
// 		@Param("month") month: string,
// 		@Param("day") day: string,
// 		@Param("filename") filename: string,
// 		@Res() res: Response,
// 	): void {
// 		const filePath = path.join(process.cwd(), "uploads", year, month, day, filename);
// 		if (!fs.existsSync(filePath)) {
// 			res.status(404).send("File not found");
// 			return;
// 		}
// 		return res.sendFile(filePath);
// 	}
// }
