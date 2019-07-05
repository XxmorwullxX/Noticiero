import { Channel, Message } from "discord.js";
import { Config } from "../Config/Config";
import * as sentences from "./../Config/elgatoconbotas.json";
import { Bot } from "./Bot";

export class ElGatoBot extends Bot {

    readonly commandName: string = "elgatoconbotas";
    readonly token: string = Config.elGatoToken;

    constructor() {
        super("elgatoconbotas");
    }

    protected onChannelMessage = async (message: Message) => {
        if (message.content.match(new RegExp("\\?", "gi"))) {
            const options = sentences.pregunta.responses;
            this.sendMessage(options, message.channel);
            return;
        }

        for (const group in sentences) {
            if (group === "general" || group === "pregunta") {
                continue;
            }

            // @ts-ignore
            if (sentences[group]) {
                // @ts-ignore
                if (message.content.match(new RegExp('^((?![a-zA-Z0-9])*)(' + sentences[group].triggers.join("|") + ')+((?![a-zA-Z0-9])*)$', 'gmi'))) {
                    // @ts-ignore
                    const options = sentences[group].responses;
                    this.sendMessage(options, message.channel);
                    return;
                }
            }
        }
        this.sendMessage(sentences.general.responses, message.channel);
    }

    private sendMessage(messages: string[], c: Channel) {
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.publishToChannel(c.id, message);
    }
}
