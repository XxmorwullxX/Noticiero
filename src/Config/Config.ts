// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
require("dotenv").config();

export class Config {
    static readonly demoToken = process.env.DEMO_TOKEN || "";
    static readonly dropboxToken = process.env.DROPBOX_TOKEN || "";
    static readonly loggerLevel = Math.min(Math.max(parseInt(process.env.VERBOSE_LEVEL || "0", 10), 0), 3);
    static readonly noticieroToken = process.env.NOTICIERO_TOKEN || "";
}
