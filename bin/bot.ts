import { NoticieroBot } from "../src/Bot/NoticieroBot";
import { DiscordClient } from "../src/Service/DiscordClient";

const run = async () => {
    const client = new DiscordClient();

    // client.attachBot(new DemoBot("demo"));
    client.attachBot(new NoticieroBot("noticiero"));
}

try {
    run();
} catch(e) {
    console.error(e);
}
