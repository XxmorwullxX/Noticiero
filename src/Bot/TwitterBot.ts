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
    static readonly loopInterval = 300000;

    readonly token = Config.noticieroToken;
    readonly commandName = "fanart";

    constructor() {
        super("fanart");

        this.initLoop(TwitterBot.loopInterval);

        this.registerCommand(this.addUserCommand, /^!fanart add user ([a-zA-Z0-9_]+) <#([0-9]+)>$/i);
        this.registerCommand(this.addHashtagCommand, /^!fanart add hashtag ([a-zA-Z0-9_]+) <#([0-9]+)>$/i);
        this.registerCommand(this.removeUserCommand, /^!fanart remove user ([a-zA-Z0-9_]+) <#([0-9]+)>$/);
        this.registerCommand(this.removeHashtagCommand, /^!fanart remove hashtag ([a-zA-Z0-9_]+) <#([0-9]+)>$/i);
        this.registerCommand(this.removeChannelCommand, /^!fanart remove channel <#([0-9]+)>$/i);
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
/*
        const x = {
            content: "this `supports` __a__ **subset** *of* ~~markdown~~ 😃 ```js\nfunction foo(bar) {\n  console.log(bar);\n}\n\nfoo(1);```",
            embed: {
                author: {
                    name: "author name",
                    url: "https://discordapp.com",
                    icon_url: "https://cdn.discordapp.com/embed/avatars/0.png"
                },
                color: 4050767,
                description: "this supports [named links](https://discordapp.com) on top of the previously shown subset of markdown. ```\nyes, even code blocks```",
                fields: [
                    {
                        name: "🤔",
                        value: "some of these properties have certain limits..."
                    },
                    {
                        name: "😱",
                        value: "try exceeding some of them!"
                    },
                    {
                        name: "🙄",
                        value: "an informative error should show up, and this view will remain as-is until all issues are fixed"
                    },
                    {
                        name: "<:thonkang:219069250692841473>",
                        value: "these last two",
                        inline: true
                    },
                    {
                        name: "<:thonkang:219069250692841473>",
                        value: "are inline fields",
                        inline: true
                    }
                ],
                footer: {
                    icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
                    text: "footer text"
                },
                image: {
                    url: "https://cdn.discordapp.com/embed/avatars/0.png"
                },
                thumbnail: {
                    url: "https://cdn.discordapp.com/embed/avatars/0.png"
                },
                timestamp: "2019-06-17T13:54:28.464Z",
                title: "title ~~(did you know you can have markdown here too?)~~",
                url: "https://discordapp.com"

            }
        };

        m.reply(x);*/
    }

    protected readonly loop = async () => {
        const channels = this.storage.get("_channels", [] as string[]);
        for (const ch of channels) {
            const channel = this.storage.get(ch) as ChannelData;
            for (const user of channel.users) {
                const tweets = await TwitterClient.instance.readTweetsFromUser(`@${user}`);
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
                const recentTweets = await TwitterClient.instance.readTweetsFromHashtag(`#${hashtag} #fanart`);
                for (const tweet of recentTweets) {
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
