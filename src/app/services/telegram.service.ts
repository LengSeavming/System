// ================================================================>> Core Library
import { Injectable, Logger } from '@nestjs/common';

// ================================================================>> Third Party Library
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
    private bot: TelegramBot;
    private readonly logger = new Logger(TelegramService.name);

    constructor() {
        try {
            this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || 'bot_token');
        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    private handleInitializationError(error: any) {
        this.logger.error(`Error initializing Telegram bot: ${error.message}`);
    }

    async sendHTMLMessage(htmlText: string) {
        const messageOptions: TelegramBot.SendMessageOptions = {
            parse_mode: 'HTML' as TelegramBot.ParseMode
        };

        try {
            await this.bot.sendMessage(process.env.TELEGRAM_CHAT_ID || 'bot_cart_id', htmlText, messageOptions);
        } catch (error) {
            this.handleSendMessageError(error);
        }
    }

    private handleSendMessageError(error: Error | any) {
        this.logger.error(`Error sending message to Telegram: ${error.message}`);
    }
}
