import { Client, Emoji, GuildMember, Message, TextChannel } from "discord.js";
import { Logger } from "../Service/Logger";
import { Storage } from "../Service/Storage";

interface Command {
    r: RegExp;
    // tslint:disable-next-line:ban-types
    cb: Function;
}

export abstract class Bot {
    abstract readonly token: string;
    abstract readonly commandName: string;
    protected readonly commands: Command[] = [];
    protected readonly name: string;
    protected readonly logger: Logger;
    protected storage: Storage = Storage.dummy();
    private readonly client: Client = new Client();

    constructor(name: string) {
        // Load persisting service
        this.name = name;
        this.logger = new Logger(name);
        Storage.load(this.name)
            .then((storage) => this.storage = storage)
            .catch((e) => {
                this.logger.error(e);
            });
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

        this.client.on("message", async (m) => {
            try {
                if (m.author.bot) {
                    return;
                }

                const content = m.content.replace(/\s+/g, " ").trim();

                if (m.content.startsWith(`!${this.commandName}`)) {
                    await this.waiting(m);
                    await this.onCommandExcuted(content, m);
                    await this.approve(m);
                    return;
                }

                if (m.content.startsWith(`!`)) {
                    return;
                }

                if (m.mentions.users.find((u) => u.id === this.client.user.id)) {
                    await this.waiting(m);
                    await this.onMentionedMessage(m);
                    await this.approve(m);
                    return;
                }

                switch (m.channel.type) {
                    case "text":
                        await this.onChannelMessage(m);
                        break;
                    case "dm":
                        await this.onPrivateMessage(m);
                        break;
                    case "group":
                        await this.onGroupMessage(m);
                        break;
                    case "category":
                    case "store":
                    case "news":
                    case "voice":
                        break;
                    default:
                        this.logger.warning(`Unknown ${m.channel.type}`);
                }
            } catch (e) {
                this.logger.error(e);
                this.reject(m);
            }
        });
    }

    protected async loop() {
        return;
    }

    protected async printHelpCommand(_m: Message): Promise<boolean | void> {
        return true;
    }

    protected async initLoop(interval: number) {
        try {
            await this.loop();
            await this.storage.commit();
        } catch (e) {
            this.logger.error(e);
        }

        const remaining = interval - (new Date()).getTime() % (interval);
        this.logger.debug(`Next loop -> ${Math.floor(remaining / 1000)}s`);
        setTimeout(() => {
            this.initLoop(interval);
        }, remaining);
    }

    // tslint:disable-next-line:no-any
    protected async publishToChannel(channel: string, message: any) {
        const c = this.client.channels.get(channel) as TextChannel;
        if (c) {
            c.send(message);
        } else {
            throw new Error(`Channel ${channel} does not exist or the bot does not have access to.`);
        }
    }

    protected getEmoji(name: string): Emoji | undefined {
        const emojis = this.client.emojis.array();
        return emojis.find((e) => e.name === name);
    }

    protected matchCommand(c: string, r: RegExp): string[] {
        const ret = (c.match(r) || [0]);
        ret.shift();

        return ret as string[];
    }

    protected hasBotRole(u: GuildMember): boolean {
        return u.roles.find((r) => r.name === "fanart") !== null;
    }

    // tslint:disable-next-line:ban-types
    protected registerCommand(cb: Function, r: RegExp) {
        this.commands.push({ cb, r });
    }

    protected onReady = async () => { return; };
    protected onChannelMessage = async (_m: Message) => { return; };
    protected onGroupMessage = async (_m: Message) => { return; };
    protected onPrivateMessage = async (_m: Message) => { return; };
    protected onMentionedMessage = async (_m: Message) => { return; };

    private async approve(m: Message) {
        const canela = this.getEmoji("canela") || { id: "👍" };
        if (canela) {
            await m.react(canela.id);
        }
        await this.removeWaiting(m);
        this.storage.commit();
    }

    private async reject(m: Message) {
        await m.react("👎");
        await this.removeWaiting(m);
        this.storage.commit();
    }

    private async waiting(m: Message) {
        await m.react("🕔");
    }

    private async removeWaiting(m: Message) {
        for (const r of m.reactions.array()) {
            if (r.emoji.name === "🕔") {
                r.remove();
                break;
            }
        }
    }

    private async onCommandExcuted(c: string, m: Message) {
        this.logger.info(c);
        for (const command of this.commands) {
            const data = this.matchCommand(c, command.r);
            if (data[0]) {
                // @ts-ignore
                data.push(m);
                command.cb.apply(this, data);
                return;
            }
        }

        if (await this.printHelpCommand(m)) {
            throw new Error("Command not found");
        }
    }
}
