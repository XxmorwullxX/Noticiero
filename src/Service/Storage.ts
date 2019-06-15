import { Dropbox } from "dropbox";
import { Config } from "../Config/Config";
import fetch from "node-fetch";
import { Logger } from "./Logger";

interface Map {
    [key: string]: Storage;
}

export class Storage {

    private static storages: Map = {};
    private static dropbox = new Dropbox({ accessToken: Config.dropboxToken, fetch: fetch });

    public static dummy(): Storage {
        return new Storage("");
    }

    public static async load(name: string): Promise<Storage> {
        this.storages[name] = this.storages[name] || new Storage(name);

        return this.storages[name];
    }

    private readonly name: string;
    private readonly storage: any = {};
    private readonly logger: Logger;
    private isDirty = false;

    put<T>(key: string, value: T) {
        if (!this.name) {
            return;
        }
        this.isDirty = true;
        this.storage[key] = value;
    }

    get<T>(key: string, def: T = undefined): T {
        if (!this.name) {
            return def;
        }
        return this.storage[key] || def;
    }

    delete(key: string) {
        if (!this.name) {
            return;
        }
        this.isDirty = true;
        delete this.storage[key];
    }

    async commit() {
        if (!this.isDirty) {
            return;
        }

        this.isDirty = false;
        this.logger.info("commit", this.storage);
        try {
            await Storage.dropbox.filesDelete({
                path: `/${this.name}.json`
            });
            await Storage.dropbox.filesUpload({
                contents: JSON.stringify(this.storage),
                path: `/${this.name}.json`
            });
        } catch (e) {
            this.logger.error(e);
        }
    }

    private constructor(name: string) {
        this.name = name;
        this.logger= new Logger(`${name} (Storage)`);

        if (name) {
            this.init().catch((e) => this.logger.error(e));
        }

    }

    private async init() {
        const files = await Storage.dropbox.filesListFolder({
            path: ""
        });
        const file = files.entries.find((f) => f.name === `${this.name}.json`);
        if (!file) {
            await Storage.dropbox.filesUpload({
                contents: "{}",
                path: `/${this.name}.json`
            });
        }

        const download = await Storage.dropbox.filesDownload({
            path: `/${this.name}.json`
        });

        // @ts-ignore
        this.storage = JSON.parse(download.fileBinary.toString());
        this.logger.info(this.storage);
    }
}
