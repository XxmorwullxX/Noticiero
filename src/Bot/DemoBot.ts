import { Message } from "discord.js";
import { Config } from "../Config/Config";
import { IDiscordBot } from "../IDiscordBot";

export class DemoBot extends IDiscordBot {

    readonly commandName: string = "demo";
    readonly name: string = "Demo";
    readonly token: string = Config.noticieroToken;

    protected onChannelMessage = async (m: Message) => {
        this.debug("channel", m.content);
    }

    protected onPrivateMessage = async (m: Message) => {
        this.debug("private", m.content);
    }

    protected onGroupMessage = async (m: Message) => {
        this.debug("group", m.content);
    }

    protected onMentionedMessage = async (m: Message) => {
        this.debug("referenced", m.content);
    }

    protected onCommandExcuted = async (c: string, args: string[], m: Message) => {
        this.debug("command", c, args);
    }
}