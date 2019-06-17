import { NoticieroBot } from "../src/Bot/NoticieroBot";
import { TwitterBot } from "../src/Bot/TwitterBot";
import { DiscordClient } from "../src/Service/DiscordClient";
import { Logger } from "../src/Service/Logger";

const logger = new Logger("Bot Manager");
logger.info("Starting...");

const run = async () => {
    const client = new DiscordClient();

    // client.attachBot(new DemoBot("demo"));
    client.attachBot(new NoticieroBot("noticiero"));
    client.attachBot(new TwitterBot("fanart"));
};

try {
    run();
} catch (e) {
    logger.error();
}
