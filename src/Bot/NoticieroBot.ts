import { GuildMember, Message, TextChannel, Channel } from "discord.js";
import { Config } from "../Config/Config";
import { Bot } from "./Bot";

type channelData = { id: string, guild: string, name: string };

export class NoticieroBot extends Bot {

    readonly commandName: string = "noticiero";
    readonly token: string = Config.noticieroToken;

    protected onChannelMessage = async (m: Message) => {
        const spamers = ['vandal.elespanol.com', 'nintenderos.com'];

        if (m.content.match(new RegExp(spamers.join('|'), 'i'))) {
            m.react('❌');
            m.react('👎');
        }
    }

    protected onCommandExcuted = async (command: string, args: string[], m: Message) => {
        if (!this.userHasPermission(m.member)) {
            return;
        }

        this.logger.info(args);
        args.shift();

    
        if (command.match(/!noticiero add (.+)/)) {
            for (const channel of m.mentions.channels.array()) {
                await this.addChannel(channel);
                await this.publishToChannel(m.channel.id, "👍");
            };
        } else if (command.match(/!noticiero remove (.+)/)) {
            for (const channel of m.mentions.channels.array()) {
                await this.removeChannel(channel);
                await this.publishToChannel(m.channel.id, "👍");
            };
        } else if (command.match(/!noticiero publish (.*)/)) {
            const [, message] = command.match(/!noticiero publish (.*)/);
            await this.publishMessage(message);
            await this.publishToChannel(m.channel.id, "👍");
        } else if (command.match(/!noticiero list/)) {
            await this.listChannels(m.channel);
        } else {
            await this.printHelp(m.channel);
        }

        await this.storage.commit();
    }

    private async addChannel(channel: TextChannel) {
        type data = { id: string, guild: string, name: string };
        const channels = ((this.storage.get("channels") || []) as data[]);

        if (!channels.find((c) => c.id === channel.id)) {
            channels.push({
                id: channel.id,
                name: channel.name,
                guild: channel.guild.name
            });

            this.storage.put("channels", channels);
        }
    }

    private async removeChannel(channel: TextChannel) {
        const channels = this.storage.get("channels", [] as channelData[]);
        this.storage.put("channels", channels.filter((c) => c.id !== channel.id));
    }

    private async listChannels(channel: Channel) {
        console.log("????");
        const channels = this.storage.get("channels", [] as channelData[]);
        for (const c of channels) {
            await this.publishToChannel(channel.id, `**#${c.name}** *${c.guild}*`)
        }
    }

    private async publishMessage(message: string) {
        const channels = this.storage.get("channels", [] as channelData[]);
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
}