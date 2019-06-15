import { Client, Message, TextChannel } from "discord.js";
import * as fs from 'fs';
import { DiscordClient } from "./Service/DiscordClient";

export abstract class IDiscordBot {
    abstract readonly token: string;
    abstract readonly name: string;
    abstract readonly commandName: string;

    private storage: any = {};
    private client: Client = new Client();
    private storageIsDirty = false;

    async login() {
        this.client.login(this.token);

        this.client.on("ready", async () => {
            if (!this.client.user.bot) {
                throw new Error("This bot is human!");
            }

            try {
                const files = await DiscordClient.storage.filesListFolder({
                    path: ""
                });
                const file = files.entries.find((f) => f.name === `${this.constructor.name}.json`);
                if (!file) {
                    await DiscordClient.storage.filesUpload({
                        contents: "{}",
                        path: `/${this.constructor.name}.json`
                    });
                }

                const download = await DiscordClient.storage.filesDownload({
                    path: `/${this.constructor.name}.json`
                });

                // @ts-ignore
                this.storage = JSON.parse(download.fileBinary.toString());
                this.info(this.storage);
            } catch (e) {
                console.log(e);
            }
            this.info("is Ready");

            this.onReady();
        });

        this.client.on("message", (m) => {
            if (m.author.bot) {
                return;
            }

            const content = m.content.replace(/\s+/g, ' ').trim();

            if (m.content.startsWith(`!${this.commandName}`)) {
                this.onCommandExcuted(content, content.split(" "), m);
                return;
            }

            if (m.content.startsWith(`!`)) {
                return;
            }

            if (m.mentions.users.find((u) => u.id === this.client.user.id)) {
                this.onMentionedMessage(m);
                return;
            }

            switch (m.channel.type) {
                case "text":
                    this.onChannelMessage(m);
                    break;
                case "dm":
                    this.onPrivateMessage(m);
                    break;
                case "group":
                    this.onGroupMessage(m);
                    break;
                case "category":
                case "store":
                case "news":
                case "voice":
                    break;
                default:
                    this.warning(`Unknown ${m.channel.type}`);
            }
        })
    }

    protected onReady = async () => {
        return;
    }

    protected onChannelMessage = async (message: Message) => { }
    protected onGroupMessage = async (message: Message) => { }
    protected onPrivateMessage = async (message: Message) => { }
    protected onMentionedMessage = async (message: Message) => { }
    protected onCommandExcuted = async (c: string, args: string[], m: Message) => { }

    protected info(...messages: any[]) {
        console.info.apply(console, [`[INFO] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
    }

    protected error(...messages: any[]) {
        console.error.apply(console, [`[ERROR] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
    }

    protected debug(...messages: any[]) {
        console.debug.apply(console, [`[DEBUG] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
    }

    protected warning(...messages: any[]) {
        console.warn.apply(console, [`[ERROR] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
    }

    protected async publishToChannel(channel: string, message: string) {
        const c = this.client.channels.get(channel) as TextChannel;
        if (c) {
            c.send(message);
        } else {
            this.error(`Channel ${channel} does not exist or the bot does not have access to.`);
        }
    }

    protected saveData(key: string, value: any) {
        this.storageIsDirty = true;
        this.storage[key] = value;
    }

    protected loadData(key: string): any {
        return this.storage[key];
    }

    protected removeData(key: string) {
        this.storageIsDirty = true;
        delete this.storage[key];
    }

    protected async commit() {
        if (!this.storageIsDirty) {
            return;
        }

        this.storageIsDirty = false;
        this.info("commit", this.storage);
        try {
            await DiscordClient.storage.filesDelete({
                path: `/${this.constructor.name}.json`
            });
            await DiscordClient.storage.filesUpload({
                contents: JSON.stringify(this.storage),
                path: `/${this.constructor.name}.json`
            });
        } catch(e) {
            this.error(e);
        }
    }
}