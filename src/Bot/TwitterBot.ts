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

    /*async onCommandExcuted(c: string, args: string[], m: Message) {
        if (!this.userHasPermission(m.member)) {
            return;
        }

        this.logger.info(args);

        if (command.match(/!fanart add @[a-zA-Z0-9_] /)) {
        }
    }*/

    async loop() {
        await TwitterClient.instance.readTweets("@zelda_fanart");

        const remaining = (new Date()).getTime() % (1000 * 60);
        setTimeout(this.loop, remaining);
    }
/*
    private userHasPermission(member: GuildMember): boolean {
        return member.roles.find((r) => r.name === "fanart") !== undefined;
    }*/
}
