import { NoticieroBot } from "../src/Bot/NoticieroBot";
import { TumblrBot } from "../src/Bot/TumblrBot";
import { TwitterBot } from "../src/Bot/TwitterBot";
import { DiscordClient } from "../src/Service/DiscordClient";
import { Logger } from "../src/Service/Logger";

const logger = new Logger("Bot Manager");
logger.info("Starting...");

const run = async () => {
    const client = new DiscordClient();

    // client.attachBot(new DemoBot(demo));
    client.attachBot(new NoticieroBot());
    client.attachBot(new TumblrBot());
    client.attachBot(new TwitterBot());
};

try {
    run();
} catch (e) {
    logger.error();
}
