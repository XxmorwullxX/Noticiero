const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);

let channelList = ['457922428883042315', '458314272691191819', '190818265923059712'];
let channels = [];

client.on('ready', () => {
    console.log('Listo para dar las noticias');

    for (const channel of channelList) {
        channels.push(client.channels.get(channel));
    }

    client.user.setGame('Noticias frescas')
});

client.on('message', (message) => {

    if (message.author.id == 491885652846313473) {
        return;
    }

    if (message.channel.type.toLowerCase() === 'dm' || message.channel.type.toLowerCase() === 'group') {
        for (const channel of channels) {
            channel.send(message.content);
        }
    }
});
