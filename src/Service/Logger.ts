import { Config } from "../Config/Config";

export class Logger {

    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    debug(...messages: any[]) {
        if (Config.loggerLevel <= 0) {
            console.debug.apply(console, [`[DEBUG] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
        }
    }

    info(...messages: any[]) {
        if (Config.loggerLevel <= 1) {
            console.info.apply(console, [`[INFO] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
        }
    }

    warning(...messages: any[]) {
        if (Config.loggerLevel <= 2) {
            console.warn.apply(console, [`[WARNING] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
        }
    }

    error(...messages: any[]) {
        if (Config.loggerLevel <= 3) {
            console.error.apply(console, [`[ERROR] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
        }
    }
}
