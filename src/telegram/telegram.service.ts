import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Telegraf } from "telegraf";

@Injectable()
export class TelegramService {
	private readonly bot: Telegraf;
	private readonly chatId: number | string;
	private readonly logger = new Logger(TelegramService.name);

	public constructor(private readonly configService: ConfigService) {
		const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN");
		if (!token) {
			throw new Error("TELEGRAM_BOT_TOKEN is not defined");
		}
		this.bot = new Telegraf(token);

		const chatId = this.configService.get<number | string | undefined>("TELEGRAM_CHAT_ID");
		if (!chatId) {
			throw new Error("TELEGRAM_CHAT_ID is not defined");
		}
		this.chatId = chatId;
	}

	public async sendMessage(text: string, chatId: number | string = this.chatId): Promise<void> {
		try {
			await this.bot.telegram.sendMessage(chatId, text);
		} catch (error) {
			this.logger.error(
				`Failed to send message to chatId ${chatId}: ${error instanceof Error ? error.message : error}`,
			);
			throw error;
		}
	}
}
