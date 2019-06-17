import { Message, TextChannel } from "discord.js";
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
    readonly loopInterval = 60000;

    constructor() {
        super("fanart");

        this.initLoop(this.loopInterval);

        this.registerCommand(this.addUserCommand, /!fanart add user ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        this.registerCommand(this.addHashtagCommand, /!fanart add hashtag ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        this.registerCommand(this.removeUserCommand, /!fanart remove user ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        this.registerCommand(this.removeHashtagCommand, /!fanart remove hashtag ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        this.registerCommand(this.removeChannelCommand, /!fanart remove channel <#([0-9]+)>/);
    }

    async addUserCommand(author: string, _ch: string, m: Message) {
        this.registerChannel(m.mentions.channels.first());
        const channel = this.storage.get(m.mentions.channels.first().id) as ChannelData;

        if (channel.users.indexOf(author) < 0) {
            channel.users.push(author);

            this.storage.put(m.mentions.channels.first().id, channel);
        }
    }

    async addHashtagCommand(hashtag: string, _ch: string, m: Message) {
        this.registerChannel(m.mentions.channels.first());
        const channel = this.storage.get(m.mentions.channels.first().id) as ChannelData;

        if (channel.hashtags.indexOf(hashtag) < 0) {
            channel.hashtags.push(hashtag);

            this.storage.put(m.mentions.channels.first().id, channel);
        }
    }

    async removeHashtagCommand(hashtag: string, _ch: string, m: Message) {
        this.registerChannel(m.mentions.channels.first());
        const channel = this.storage.get(m.mentions.channels.first().id) as ChannelData;

        if (channel.hashtags.indexOf(hashtag) >= 0) {
            channel.hashtags = channel.hashtags.filter((h) => h !== hashtag);
            this.storage.put(m.mentions.channels.first().id, channel);
        }
    }

    async removeUserCommand(user: string, _ch: string, m: Message) {
        this.registerChannel(m.mentions.channels.first());
        const channel = this.storage.get(m.mentions.channels.first().id) as ChannelData;

        if (channel.users.indexOf(user) >= 0) {
            channel.users = channel.users.filter((u) => u !== user);
            this.storage.put(m.mentions.channels.first().id, channel);
        }
    }

    async removeChannelCommand(ch: string) {
        const channels = this.storage.get("_channels", [] as string[]);
        this.storage.put("_channels", channels.filter((c) => c !== ch));
        this.storage.delete(ch);
    }

    async printHelpCommand(m: Message) {
        const channel = m.channel;
        await this.publishToChannel(channel.id, "**!fanart add user** *user* *#channel*");
        await this.publishToChannel(channel.id, "**!fanart add hashtag** *hashtag* *#channel*");
        await this.publishToChannel(channel.id, "**!fanart remove channel** *#channel*");
        await this.publishToChannel(channel.id, "**!fanart remove user** *user* *#channel*");
        await this.publishToChannel(channel.id, "**!fanart remove hashtag** *hashtag* *#channel*");
    }

    protected readonly loop = async () => {
        // tslint:disable-next-line:no-console
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
                const recentTweets = await TwitterClient.instance.readTweetsFromHashtag(`${hashtag} #fanart`, "recent");
                for (const tweet of recentTweets) {
                    this.logger.debug(tweet.url);
                    if (!channel.medias.find((m) => m.id === tweet.id)) {
                        await this.publishToChannel(channel.id, tweet.url);
                        channel.medias.push(tweet);
                        this.storage.put(ch, channel);
                    }
                }

                const topTweets = await TwitterClient.instance.readTweetsFromHashtag(`${hashtag} #fanart`, "popular");
                for (const tweet of topTweets) {
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
