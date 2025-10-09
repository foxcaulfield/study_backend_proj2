import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fs from "fs";
import path from "path";
import { UploadedFile } from "./uploaded-file.interface";
import crypto from "crypto";
import sharp from "sharp";

type MulterFile = Express.Multer.File;

@Injectable()
export class FilesService {
	public constructor(private readonly configService: ConfigService) {}

	private static readonly IMAGE_MIME_TYPES = [
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif",
		"image/bmp",
		"image/tiff",
		"image/svg+xml",
	];

	private getUploadsRoot(): string {
		// prefer env/config value, fallback to process.cwd()/uploads
		const base = this.configService.get<string>("UPLOADS_DIR") ?? path.join(process.cwd(), "uploads");
		return base;
	}

	private async uploadFile(file: MulterFile): Promise<UploadedFile> {
		const now = new Date();
		const year = String(now.getFullYear());
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");

		// Strong unique id using crypto
		const id = crypto.randomUUID();

		const originalName = file.originalname;
		const compiledName = `${id}${path.extname(originalName)}`;

		const dirPath = path.join(this.getUploadsRoot(), year, month, day);
		const filePath = path.join(dirPath, compiledName);

		// mkdir asynchronously, with parents
		await fs.promises.mkdir(dirPath, { recursive: true });

		let bufferToWrite = file.buffer;

		if (FilesService.IMAGE_MIME_TYPES.includes(file.mimetype)) {
			try {
				bufferToWrite = await sharp(file.buffer).resize({ width: 500, fit: "inside" }).toBuffer();
			} catch (error: unknown) {
				// Handle image processing errors
				if (error instanceof Error) {
					throw new Error("Failed to process image file: " + error.message);
				} else {
					throw new Error("Failed to process image file");
				}
			}
		}

		// write file to disk asynchronously
		await fs.promises.writeFile(filePath, bufferToWrite);

		// create an interface for the returned file

		return {
			id: id,
			compiledName: path.join(year, month, day, compiledName),
			originalName: originalName,
			mimeType: file.mimetype,
			size: file.size,
		};
	}

	public async uploadFiles(files: MulterFile[]): Promise<UploadedFile[]> {
		const uploadPromises = files.map((file): Promise<UploadedFile> => this.uploadFile(file));
		const uploadedFiles = await Promise.all(uploadPromises);
		return uploadedFiles;
	}
}
