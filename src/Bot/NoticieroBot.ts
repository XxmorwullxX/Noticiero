import { GuildMember, Message, TextChannel, Channel } from "discord.js";
import { Config } from "../Config/Config";
import { IDiscordBot } from "../IDiscordBot";

export class NoticieroBot extends IDiscordBot {

    readonly commandName: string = "noticiero";
    readonly name: string = "Noticiero";
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

        this.info(args);
        args.shift();

        if (command.match(/!noticiero add (.+)/)) {
            m.mentions.channels.forEach((channel) => {
                this.addChannel(channel);
                this.publishToChannel(m.channel.id, "👍🏻");
            });
        } else if (command.match(/!noticiero remove (.+)/)) {
            m.mentions.channels.forEach((channel) => {
                this.removeChannel(channel);
                this.publishToChannel(m.channel.id, "👍🏻");
            });
        } else if (command.match(/!noticiero publish (.*)/)) {
            const [, message] = command.match(/!noticiero publish (.*)/);
            this.publishMessage(message);
            this.publishToChannel(m.channel.id, "👍🏻");
        } else if (command.match(/!noticiero list/)) {
            this.listChannels(m.channel);
            this.publishToChannel(m.channel.id, "👍🏻");
        } else {
            this.printHelp(m.channel).catch(() => { });
        }

        this.commit();
    }

    private addChannel(channel: TextChannel) {
        type data = { id: string, guild: string, name: string };
        const channels = ((this.loadData("channels") || []) as data[]);

        if (!channels.find((c) => c.id === channel.id)) {
            channels.push({
                id: channel.id,
                name: channel.name,
                guild: channel.guild.name
            });

            this.saveData("channels", channels);
        }
    }

    private removeChannel(channel: TextChannel) {
        type data = { id: string, guild: string, name: string };
        const channels = (this.loadData("channels") || []) as data[];
        this.saveData("channels", channels.filter((c) => c.id !== channel.id));
    }

    private listChannels(channel: Channel) {
        type data = { id: string, guild: string, name: string };
        const channels = (this.loadData("channels") || []) as data[];
        for (const c of channels) {
            this.publishToChannel(channel.id, `**#${c.name}** *${c.guild}*`).catch(() => { });
        }
    }

    private publishMessage(message: string) {
        const channels = (this.loadData("channels") || []) as string[];
        for (const channel of channels) {
            this.publishToChannel(channel, message).catch(() => { });
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