const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);

let channels = {};

/*
 * Aquí pones el tag y el canal que quieres que tenga el tag, me he inventado los valores
 */
const tags = {
    PS: "457922428883042315"
    PC: "190818265923059712", "457922428883042315", "494757740292603904"
    NS: "458314272691191819"
    TV: "244014666139828225", "457952200212348939", "395736059129888778", "294223645730144256"
};


client.on('ready', () => {
    console.log('Listo para dar las noticias');

    for (const tag in tags) {
        channels[tag] = client.channels.get(channel);
    }

    client.user.setGame('Noticias frescas')
});


client.on('message', (message) => {
    if (message.author.id == 491885652846313473) {
        return;
    }

    for (const channel of channels) {
        if (channel.type.toLowerCase() === 'dm' || channel.type.toLowerCase() === 'group') {
            const splittedMessage = message.split(':', message.content);
            const realMessage = splittedMessage[1];
            const rawTagList = splittedMessage[0].split(',');

            for (tag of rawTagList) {
                channels[tag].send(realMessage);
            }
        }
    }
});
