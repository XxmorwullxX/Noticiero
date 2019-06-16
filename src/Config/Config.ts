// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
require("dotenv").config();

export class Config {
    static readonly loggerLevel = Math.min(Math.max(parseInt(process.env.VERBOSE_LEVEL || "0", 10), 0), 3);
    static readonly noticieroToken = process.env.NOTICIERO_TOKEN || "";
    static readonly demoToken = process.env.DEMO_TOKEN || "";
    static readonly dropboxToken = process.env.DROPBOX_TOKEN || "";
    static readonly twitter = {
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY || "",
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
        consumer_key: process.env.TWITTER_CONSUMER_KEY || "",
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET || ""
    };
}
