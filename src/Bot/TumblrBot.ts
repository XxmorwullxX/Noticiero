import { Message, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { TumblrClient } from "../Service/TumblrClient";
import { Bot } from "./Bot";

interface Post {
    id: string;
    photos: string[];
    author: string;
    text: string;
    title: string;
    source: string;
    tags: string[];
    color: string;
    avatar: string;
}

interface ChannelData {
    id: string;
    guild: string;
    name: string;
    medias: string[];
    tags: string[];
}

export class TumblrBot extends Bot {
    static readonly loopInterval = 300000;
    readonly token = Config.noticieroToken;
    readonly commandName = "tumblr";

    constructor() {
        super("tumblr");

        this.initLoop(TumblrBot.loopInterval);

        this.registerCommand(this.addTagCommand, /^!tumblr add (.+) <#([0-9]+)>$/i);
        this.registerCommand(this.removeTagCommand, /^!tumblr remove (.+) <#([0-9]+)>$/i);
        this.registerCommand(this.removeChannelCommand, /^!tumblr remove <#([0-9]+)>$/i);
    }

    async addTagCommand(tag: string, _ch: string, m: Message) {
        this.registerChannel(m.mentions.channels.first());
        const channel = this.storage.get(m.mentions.channels.first().id) as ChannelData;

        if (channel.tags.indexOf(tag) < 0) {
            channel.tags.push(tag);

            this.storage.put(m.mentions.channels.first().id, channel);
        }
    }

    async removeTagCommand(tag: string, _ch: string, m: Message) {
        this.registerChannel(m.mentions.channels.first());
        const channel = this.storage.get(m.mentions.channels.first().id) as ChannelData;

        if (channel.tags.indexOf(tag) < 0) {
            channel.tags.push(tag);

            this.storage.put(m.mentions.channels.first().id, channel);
        }
    }

    async removeChannelCommand(ch: string) {
        const channels = this.storage.get("_channels", [] as string[]);
        this.storage.put("_channels", channels.filter((c) => c !== ch));
        this.storage.delete(ch);
    }

    async printHelpCommand(m: Message) {
        await this.publishToChannel(m.channel.id, "**!tumblr add** *tag* *#channel*");
        await this.publishToChannel(m.channel.id, "**!tumblr remove** *tag* *#channel*");
        await this.publishToChannel(m.channel.id, "**!tumblr remove** *#channel*");
    }

    protected readonly loop = async () => {
        const channels = this.storage.get("_channels", [] as string[]);
        for (const ch of channels) {
            const channel = this.storage.get(ch) as ChannelData;
            this.logger.debug(channel.tags);
            for (const tag of channel.tags) {
                this.logger.debug(tag);
                const posts = await TumblrClient.instance.get(`${tag} fanart`);

                for (const post of posts) {
                    if (!channel.medias.find((m) => m === post.id)) {
                        await this.publishPost(post, channel.id);
                        channel.medias.push(post.id);
                        this.storage.put(ch, channel);
                    }
                }
            }
        }
    }

    private async publishPost(post: Post, channel: string) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < post.photos.length; i++) {
            if (i === 0) {
                await this.publishToChannel(channel, {
                    content: "",
                    embed: {
                        author: {
                            icon_url: post.avatar,
                            name: post.author,
                            url: post.source
                        },
                        color: parseInt(("0x" + post.color.substr(1)), 16),
                        description: post.tags.join(" "),
                        fields: [
                            {
                                name: "photos",
                                value: post.photos.length.toString()
                            }
                        ],
                        image: {
                            url: post.photos[i]
                        },
                        title: post.title,
                        url: post.source

                    }
                });
            } else {
                await this.publishToChannel(channel, {
                    color: parseInt(("0x" + post.color.substr(1)), 16),
                    embed: {
                        image: {
                            url: post.photos[i]
                        }
                    }
                });
            }
        }
    }

    private registerChannel(ch: TextChannel) {
        const channels = this.storage.get("_channels", [] as string[]);

        if (channels.indexOf(ch.id) < 0) {
            channels.push(ch.id);
            this.storage.put("_channels", channels);
        }

        const channel = this.storage.get(ch.id, undefined) as ChannelData | undefined;

        if (!channel) {
            this.storage.put(ch.id, {
                guild: ch.guild.name,
                id: ch.id,
                medias: [],
                name: ch.name,
                tags: []
            });
        }
    }
}
