import { Config } from "../Config/Config";

export class Logger {

    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    // tslint:disable-next-line:no-any
    debug(...messages: any[]) {
        if (Config.loggerLevel <= 0) {
            // @ts-ignore
            // tslint:disable-next-line:no-console
            console.debug.apply(console, [`[DEBUG] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
        }
    }

    // tslint:disable-next-line:no-any
    info(...messages: any[]) {
        if (Config.loggerLevel <= 1) {
            // @ts-ignore
            // tslint:disable-next-line:no-console
            console.info.apply(console, [`[INFO] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
        }
    }

    // tslint:disable-next-line:no-any
    warning(...messages: any[]) {
        if (Config.loggerLevel <= 2) {
            // @ts-ignore
            // tslint:disable-next-line:no-console
            console.warn.apply(console, [`[WARNING] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
        }
    }

    // tslint:disable-next-line:no-any
    error(...messages: any[]) {
        if (Config.loggerLevel <= 3) {
            // @ts-ignore
            // tslint:disable-next-line:no-console
            console.error.apply(console, [`[ERROR] ${this.name}:`].concat(Array.prototype.slice.call(messages, 0)));
        }
    }
}
