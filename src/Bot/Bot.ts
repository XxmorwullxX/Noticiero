import { Client, Message, TextChannel } from "discord.js";
import { Logger } from "../Service/Logger";
import { Storage } from "../Service/Storage";

export abstract class Bot {
    abstract readonly token: string;
    abstract readonly commandName: string;

    protected readonly name: string;
    protected readonly logger: Logger;
    protected storage: Storage;
    private client: Client = new Client();

    constructor(name: string) {
        // Load persisting service
        this.name = name;
        this.logger = new Logger(name);
        Storage.load(this.name)
            .then((storage) => this.storage = storage)
            .catch((e) => this.logger.error(e));
    }

    async login() {
        this.client.login(this.token);

        this.client.on("ready", async () => {
            if (!this.client.user.bot) {
                throw new Error("This bot is human!");
            }

            this.logger.info("is Ready");

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
                    this.logger.warning(`Unknown ${m.channel.type}`);
            }
        })
    }

    protected async publishToChannel(channel: string, message: string) {
        const c = this.client.channels.get(channel) as TextChannel;
        if (c) {
            c.send(message);
        } else {
            this.logger.error(`Channel ${channel} does not exist or the bot does not have access to.`);
        }
    }

    protected onReady = async () => { }
    protected onChannelMessage = async (message: Message) => { }
    protected onGroupMessage = async (message: Message) => { }
    protected onPrivateMessage = async (message: Message) => { }
    protected onMentionedMessage = async (message: Message) => { }
    protected onCommandExcuted = async (c: string, args: string[], m: Message) => { }
}