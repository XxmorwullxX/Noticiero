require('dotenv').config();

export const Config = {
    demoToken: process.env.DEMO_TOKEN,
    noticieroToken: process.env.NOTICIERO_TOKEN,
    dropboxToken: process.env.DROPBOX_TOKEN,
    loggerLevel: Math.min(Math.max(parseInt(process.env.VERBOSE_LEVEL || "0", 10), 0), 3)
};
