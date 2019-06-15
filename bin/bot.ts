import { NoticieroBot } from "../src/Bot/NoticieroBot";
import { DiscordClient } from "../src/Service/DiscordClient";

const run = async () => {
    const client = new DiscordClient();

    // client.attachBot(new DemoBot());
    client.attachBot(new NoticieroBot());
}

try {
    run();
} catch(e) {
    console.error(e);
}
