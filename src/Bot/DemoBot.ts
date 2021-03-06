import { Message } from "discord.js";
import { Config } from "../Config/Config";
import { Bot } from "./Bot";

export class DemoBot extends Bot {

    readonly commandName: string = "demo";
    readonly token: string = Config.noticieroToken;

    constructor() {
        super("demo");
    }

    protected onChannelMessage = async (m: Message) => {
        this.logger.debug("channel", m.content);
    }

    protected onPrivateMessage = async (m: Message) => {
        this.logger.debug("private", m.content);
    }

    protected onGroupMessage = async (m: Message) => {
        this.logger.debug("group", m.content);
    }

    protected onMentionedMessage = async (m: Message) => {
        this.logger.debug("referenced", m.content);
    }
}
