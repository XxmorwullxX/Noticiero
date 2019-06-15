import { Dropbox } from "dropbox";
import { Bot } from "../Bot/Bot";
import { Config } from "../Config/Config";
import fetch from "node-fetch";

export class DiscordClient {

    private client: string = "";
    private bots: Bot[] = [];
    public static readonly storage: Dropbox = new Dropbox({ accessToken: Config.dropboxToken, fetch: fetch });

    async attachBot(bot: Bot) {
        this.bots.push();
        await bot.login();
    }
}
