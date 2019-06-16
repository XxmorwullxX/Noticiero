import { Channel, GuildMember, Message, TextChannel } from "discord.js";
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
        if (!this.userHasPermission(m.member)) {
            return;
        }

        if (command.match(/!noticiero add (.+)/)) {
            for (const channel of m.mentions.channels.array()) {
                await this.addChannel(channel);
            }
        } else if (command.match(/!noticiero remove (.+)/)) {
            for (const channel of m.mentions.channels.array()) {
                await this.removeChannel(channel);
            }
        } else if (command.match(/!noticiero publish (.*)/)) {
            const [, message] = command.match(/!noticiero publish (.*)/) || ["", ""];
            await this.publishMessage(message);
        } else if (command.match(/!noticiero list/)) {
            await this.listChannels(m.channel);
        } else {
            await this.printHelp(m.channel);
        }

        this.confirmMessage(m);
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

    private userHasPermission(member: GuildMember): boolean {
        return member.roles.find((r) => r.name === "noticiero") !== undefined;
    }

    private async confirmMessage(message: Message) {
        const canela = this.getEmoji("canela") || this.getEmoji("slowpoke") || { id: "👍" };
        if (canela) {
            await message.react(canela.id);
        }
    }
}
