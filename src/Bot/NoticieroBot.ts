import { Message } from "discord.js";
import { Config } from "../Config/Config";
import { Bot } from "./Bot";

interface ChannelData { id: string; guild: string; name: string; }

export class NoticieroBot extends Bot {

    readonly commandName: string = "noticiero";
    readonly token: string = Config.noticieroToken;

    constructor() {
        super("noticiero");

        this.registerCommand(this.addChannelCommand, /^!noticiero add <#([0-9]+)>$/);
        this.registerCommand(this.removeChannelCommand, /^!noticiero remove <#([0-9]+)>$/);
        this.registerCommand(this.publishMessageCommand, /^!noticiero publish (.+)$/);
        this.registerCommand(this.listChannelsCommand, /^!noticiero (list)$/);
    }

    async addChannelCommand(_ch: string, m: Message) {
        const channel = m.mentions.channels.first();
        const channels = this.storage.get("channels", [] as ChannelData[]);

        if (!channels.find((c) => c.id === channel.id)) {
            channels.push({
                guild: channel.guild.name,
                id: channel.id,
                name: channel.name
            });

            this.storage.put("channels", channels);
        }
    }

    async removeChannelCommand(_ch: string, m: Message) {
        const channel = m.mentions.channels.first();
        const channels = this.storage.get("channels", [] as ChannelData[]);
        this.storage.put("channels", channels.filter((c) => c.id !== channel.id));
    }

    async listChannelsCommand() {
        const channels = this.storage.get("channels", [] as ChannelData[]);
        for (const c of channels) {
            await this.publishToChannel(c.id, `**#${c.name}** *${c.guild}*`);
        }
    }

    async publishMessageCommand(message: string) {
        const channels = this.storage.get("channels", [] as ChannelData[]);
        for (const channel of channels) {
            await this.publishToChannel(channel.id, message);
        }
    }

    async printHelpCommand(m: Message) {
        const channel = m.channel;
        await this.publishToChannel(channel.id, "**!noticiero add** *#canal*");
        await this.publishToChannel(channel.id, "**!noticiero remove** *#canal*");
        await this.publishToChannel(channel.id, "**!noticiero publish** *#canal*");
        await this.publishToChannel(channel.id, "**!noticiero list**");
    }

    protected onChannelMessage = async (m: Message) => {
        const spamers = ["vandal.elespanol.com", "nintenderos.com"];

        if (m.content.match(new RegExp(spamers.join("|"), "i"))) {
            const sasel = this.getEmoji("sasel");
            if (sasel) {
                await m.react(sasel.id);
            }
            await m.react("🇧");
            await m.react("🇦");
            await m.react("🇳");
        }
    }
}
