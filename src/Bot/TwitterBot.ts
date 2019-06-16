import { GuildMember, Message } from "discord.js";
import { Config } from "../Config/Config";
import { TwitterClient } from "../Service/TwitterClient";
import { Bot } from "./Bot";

export class TwitterBot extends Bot {
    readonly token = Config.noticieroToken;
    readonly commandName = "fanart";

    constructor() {
        super("Zelda fanart");

        this.loop().catch((e) => {
            this.logger.error(e);
        });
    }

    async loop() {
        const tweets = await TwitterClient.instance.readTweets("@zelda_fanart");
        this.logger.debug(tweets);

        const remaining = (new Date()).getTime() % (1000 * 60);
        this.logger.debug(remaining);
        setTimeout(this.loop, remaining);
    }

    protected onCommandExcuted = async (command: string, args: string[], m: Message) => {
        if (!this.userHasPermission(m.member)) {
            return;
        }

        this.logger.info(args);

        if (command.match(/!fanart add (@[a-zA-Z0-9_]) <#([0-9]+)>/)) {
            const [, author, channel] = command.match(/!fanart add (@[a-zA-Z0-9_]) <#([0-9]+)>/) || ["", "", ""];
            this.logger.info(author, channel);
        }
    }

    private userHasPermission(member: GuildMember): boolean {
        return member.roles.find((r) => r.name === "fanart") !== undefined;
    }
}
