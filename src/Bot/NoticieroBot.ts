import { Channel, Message, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { Bot } from "./Bot";

interface ChannelData { id: string; guild: string; name: string; }

export class NoticieroBot extends Bot {

    readonly commandName: string = "noticiero";
    readonly token: string = Config.noticieroToken;

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

    protected onCommandExcuted = async (command: string, m: Message) => {
        if (!this.hasBotRole(m.member)) {
            throw new Error("Insufficient permission");
        }

        const [addChannel] = this.matchCommand(command, /!noticiero add <#([0-9]+)>/);
        const [removeChannel] = this.matchCommand(command, /!noticiero remove <#([0-9]+)>/);
        const [publishMessage] = this.matchCommand(command, /!noticiero publish ([a-zA-Z0-9_]+)/);
        const [list] = this.matchCommand(command, /!noticiero (list)/);

        if (addChannel) {
            await this.addChannel(m.mentions.channels.first());
        } else if (removeChannel) {
            await this.removeChannel(m.mentions.channels.first());
        } else if (publishMessage) {
            await this.publishMessage(publishMessage);
        } else if (list) {
            await this.listChannels(m.channel);
        } else {
            await this.printHelp(m.channel);
        }

        await this.storage.commit();
    }

    private async addChannel(channel: TextChannel) {
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

    private async removeChannel(channel: TextChannel) {
        const channels = this.storage.get("channels", [] as ChannelData[]);
        this.storage.put("channels", channels.filter((c) => c.id !== channel.id));
    }

    private async listChannels(channel: Channel) {
        const channels = this.storage.get("channels", [] as ChannelData[]);
        for (const c of channels) {
            await this.publishToChannel(channel.id, `**#${c.name}** *${c.guild}*`);
        }
    }

    private async publishMessage(message: string) {
        const channels = this.storage.get("channels", [] as ChannelData[]);
        for (const channel of channels) {
            await this.publishToChannel(channel.id, message);
        }
    }

    private async printHelp(channel: Channel) {
        await this.publishToChannel(channel.id, "**!noticiero add** *#canal*");
        await this.publishToChannel(channel.id, "**!noticiero remove** *#canal*");
        await this.publishToChannel(channel.id, "**!noticiero publish** *#canal*");
        await this.publishToChannel(channel.id, "**!noticiero list**");
    }
}
