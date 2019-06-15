import { Bot } from "../Bot/Bot";

export class DiscordClient {

    private readonly bots: Bot[] = [];

    async attachBot(bot: Bot) {
        this.bots.push();
        await bot.login();
    }
}
