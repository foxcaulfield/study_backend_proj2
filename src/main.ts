import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, {
		bodyParser: false,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true, // <- here
			forbidUnknownValues: true,
			// disableErrorMessages: true,
		}),
	);

	const config = new DocumentBuilder()
		.setTitle("Application Title")
		.setDescription("The Application API Description")
		.setVersion("1.0")
		.addTag("app")
		.build();
	const documentFactory = (): OpenAPIObject => SwaggerModule.createDocument(app, config);

	// Setup SwaggerUI
	SwaggerModule.setup("api", app, documentFactory);

	// Save OpenAPI File
	const outputPath = join(process.cwd(), "swagger-spec.json");
	writeFileSync(outputPath, JSON.stringify(documentFactory(), null, 2));

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((e): void => console.error(e));
