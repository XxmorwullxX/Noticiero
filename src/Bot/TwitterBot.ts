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

    constructor() {
        super("fanart");

        this.loop().catch((e) => {
            this.logger.error(e.message);
        });
    }

    protected onCommandExcuted = async (command: string, m: Message) => {
        if (!this.hasBotRole(m.member)) {
            throw new Error("Insufficient permission");
        }

        const [addUser] = this.matchCommand(command, /!fanart add user ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        const [addHashTag] = this.matchCommand(command, /!fanart add hashtag ([a-zA-Z0-9_]+) <#([0-9]+)>/);
        const [removeHashTag] = this.matchCommand(command, /!fanart remove hashtag ([a-zA-Z0-9_]+) <#([0-9]+)>/);

        if (addUser) {
            await this.addUser(`@${addUser}`, m.mentions.channels.first());
        } else if (addHashTag) {
            await this.addHashtag(`#${addHashTag}`, m.mentions.channels.first());
        } else if (removeHashTag) {
            await this.removeHashtag(`#${removeHashTag}`, m.mentions.channels.first());
        } else {
            throw new Error("Invalid command");
        }

        await this.storage.commit();
    }

    private readonly loop = async () => {
        const remaining = 60000 - (new Date()).getTime() % (60000);
        this.logger.debug(remaining);
        setTimeout(() => {
            this.loop().catch((e) => {
                this.logger.error(e.message);
            });
        }, remaining);

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

        await this.storage.commit();
    }

    private async addUser(author: string, ch: TextChannel) {
        this.registerChannel(ch);
        const channel = this.storage.get(ch.id) as ChannelData;

        await this.publishToChannel(ch.id, `Buenas, a partir de ahora voy a poner fanarts retwiteados por ${author}`);

        if (channel.users.indexOf(author) < 0) {
            channel.users.push(author);

            this.storage.put(ch.id, channel);
        }
    }

    private async addHashtag(hashtag: string, ch: TextChannel) {
        this.registerChannel(ch);
        const channel = this.storage.get(ch.id) as ChannelData;

        if (channel.hashtags.indexOf(hashtag) < 0) {
            channel.hashtags.push(hashtag);

            this.storage.put(ch.id, channel);
        }
    }

    private async removeHashtag(hashtag: string, ch: TextChannel) {
        this.registerChannel(ch);
        const channel = this.storage.get(ch.id) as ChannelData;

        if (channel.hashtags.indexOf(hashtag) >= 0) {
            channel.hashtags = channel.hashtags.filter((h) => h !== hashtag);
            this.storage.put(ch.id, channel);
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
