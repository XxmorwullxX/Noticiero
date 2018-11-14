const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);

let channelList = ['190818265923059712', '457922428883042315', '494757740292603904'];
let channels = [];

var dominiosnegativos = ['https://vandal.elespanol.com/', 'https://www.nintenderos.com/']


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

  client.on("message", (message) => {
     if (message.content.match(new RegExp(dominiosnegativos.join('|'), 'i'))) {
    message.react('❌');
   }
});
  
    if (message.channel.type.toLowerCase() === 'dm' || message.channel.type.toLowerCase() === 'group') {
        for (const channel of channels) {
            channel.send(message.content);
        }
    }
});
