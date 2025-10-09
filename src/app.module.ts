import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule, MongooseModuleFactoryOptions } from "@nestjs/mongoose";
import { RoomsModule } from "./rooms/rooms.module";
import { ReservationsModule } from "./reservations/reservations.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { FilesModule } from "./files/files.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), "uploads"),
			serveRoot: "/static",
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: "./.env",
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService): MongooseModuleFactoryOptions => {
				const host = configService.get<string>("MONGO_HOST");
				const port = configService.get<string>("MONGO_PORT");
				const user = configService.get<string>("MONGO_INITDB_ROOT_USERNAME");
				const pass = configService.get<string>("MONGO_INITDB_ROOT_PASSWORD");
				const db = configService.get<string>("MONGO_INITDB_DATABASE");
				const uri = `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`;
				// const uri = `mongodb://root:example@localhost:27017/default_db?authSource=admin`;

				return {
					uri,
				};
			},
		}),
		RoomsModule,
		ReservationsModule,
		UsersModule,
		AuthModule,
		FilesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
