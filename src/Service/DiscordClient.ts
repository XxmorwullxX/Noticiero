import { Dropbox } from "dropbox";
import { IDiscordBot } from "../IDiscordBot";
import { Config } from "../Config/Config";
import fetch from "node-fetch";

export class DiscordClient {

    private client: string = "";
    private bots: IDiscordBot[] = [];
    public static readonly storage: Dropbox = new Dropbox({ accessToken: Config.dropboxToken, fetch: fetch });

    async attachBot(bot: IDiscordBot) {
        this.bots.push();
        await bot.login();
    }
}
