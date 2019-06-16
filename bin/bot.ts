import { NoticieroBot } from "../src/Bot/NoticieroBot";
import { DiscordClient } from "../src/Service/DiscordClient";
import { Logger } from "../src/Service/Logger";

const logger = new Logger("Bot Manager");
logger.info("Starting...");

const run = async () => {
    const client = new DiscordClient();

    // client.attachBot(new DemoBot("demo"));
    client.attachBot(new NoticieroBot("noticiero"));
}

try {
    run();
} catch(e) {
    logger.error();
}
