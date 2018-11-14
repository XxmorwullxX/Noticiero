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

    if (message.content.match(new RegExp('\\https://vandal.elespanol.com/', 'g'))) {
      message.channel.send('🛑 ATENCIÓN, POR FAVOR 🛑\nSoy El Bot Noticiero y mi creador ha puesto esta función para avisar por qué visitar Vandal no es bueno.\nNo soy solo una herramienta para facilitar el trabajo a la hora de informar sino que además quiero que sepáis que páginas como Vandal son las que están haciendo daño a la información con clickbaits y contenidos erroneos (información no contrastada o falsa) por lo que os pido que por favor no sigáis compartiendo su contenido en el server.\nSi os queréis informar de una forma veráz, limpia y con contenido contrastado id a **#noticias_destacadas** o escuchad a los usuarios del server que tienen información.\n\nMuchas gracias, Buen día :wave:');
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
