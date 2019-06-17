import { Channel, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { TwitterClient } from "../Service/TwitterClient";
import { Bot } from "./Bot";

interface ChannelData {
    id: string;
    guild: string;
    name: string;
    medias: Tweet[];
    users: string[];
    hashtags: string[];
}

interface Tweet {
    id: string;
    url: string;
}

export class TwitterBot extends Bot {
    readonly token = Config.noticieroToken;
    readonly commandName = "fanart";

    constructor() {
        super("fanart");

        this.initLoop(300000);

        this.registerCommand(this.addUserCommand, /!fanart add user ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        this.registerCommand(this.addHashtagCommand, /!fanart add hashtag ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        this.registerCommand(this.removeUserCommand, /!fanart remove user ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        this.registerCommand(this.removeHashtagCommand, /!fanart remove hashtag ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        this.registerCommand(this.removeChannelCommand, /!fanart remove channel <#([0-9]+)>/);
    }

    async addUserCommand(author: string, ch: TextChannel) {
        this.registerChannel(ch);
        const channel = this.storage.get(ch.id) as ChannelData;

        await this.publishToChannel(ch.id, `Buenas, a partir de ahora voy a poner fanarts retwiteados por ${author}`);

        if (channel.users.indexOf(author) < 0) {
            channel.users.push(author);

            this.storage.put(ch.id, channel);
        }
    }

    async addHashtagCommand(hashtag: string, ch: TextChannel) {
        this.registerChannel(ch);
        const channel = this.storage.get(ch.id) as ChannelData;

        if (channel.hashtags.indexOf(hashtag) < 0) {
            channel.hashtags.push(hashtag);

            this.storage.put(ch.id, channel);
        }
    }

    async removeHashtagCommand(hashtag: string, ch: TextChannel) {
        this.registerChannel(ch);
        const channel = this.storage.get(ch.id) as ChannelData;

        if (channel.hashtags.indexOf(hashtag) >= 0) {
            channel.hashtags = channel.hashtags.filter((h) => h !== hashtag);
            this.storage.put(ch.id, channel);
        }
    }

    async removeUserCommand(user: string, ch: TextChannel) {
        this.registerChannel(ch);
        const channel = this.storage.get(ch.id) as ChannelData;

        if (channel.users.indexOf(user) >= 0) {
            channel.users = channel.users.filter((u) => u !== user);
            this.storage.put(ch.id, channel);
        }
    }

    async removeChannelCommand(ch: TextChannel) {
        const channels = this.storage.get("_channels", [] as string[]);
        this.storage.put("_channels", channels.filter((c) => c !== ch.id));
        this.storage.delete(ch.id);
    }

    async printHelp(channel: Channel) {
        await this.publishToChannel(channel.id, "**!fanart add user** *user* *#channel*");
        await this.publishToChannel(channel.id, "**!fanart add hashtag** *hashtag* *#channel*");
        await this.publishToChannel(channel.id, "**!fanart remove channel *#channel*");
        await this.publishToChannel(channel.id, "**!fanart remove user** *user* *#channel*");
        await this.publishToChannel(channel.id, "**!fanart remove hashtag** *hashtag* *#channel*");
    }

    protected readonly loop = async () => {
        const channels = this.storage.get("_channels", [] as string[]);
        for (const ch of channels) {
            const channel = this.storage.get(ch) as ChannelData;
            for (const user of channel.users) {
                const tweets = await TwitterClient.instance.readTweetsFromUser(user);
                for (const tweet of tweets) {
                    if (!channel.medias.find((m) => m.id === tweet.id)) {
                        await this.publishToChannel(channel.id, tweet.url);
                        channel.medias.push(tweet);
                        this.storage.put(ch, channel);
                    }
                }
            }

            this.logger.debug(channel.hashtags);
            for (const hashtag of channel.hashtags) {
                const tweets = await TwitterClient.instance.readTweetsFromHashtag(`${hashtag} #fanart -filter:retweets`);
                for (const tweet of tweets) {
                    this.logger.debug(tweet.url);
                    if (!channel.medias.find((m) => m.id === tweet.id)) {
                        await this.publishToChannel(channel.id, tweet.url);
                        channel.medias.push(tweet);
                        this.storage.put(ch, channel);
                    }
                }
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
                hashtags: [],
                id: ch.id,
                medias: [],
                name: ch.name,
                users: []
            });
        }
    }
}
