const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);

let channelList = ['190818265923059712', '457922428883042315', '494757740292603904'];
let channels = [];

function frasesvandal() {
  var rand = [, 
              ];

  return rand[Math.floor(Math.random()*rand.length)];
}

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
      message.channel.send('🛑 ATENCIÓN, POR FAVOR 🛑\nSoy el bot informativo y mi creador ha puesto esta función para avisar por qué visitar Vandal no es bueno.\nMi creador no solo me utiliza como una herramienta para facilitar su trabajo a la hora de informar sino que además quiere que sepáis que páginas como Vandal son las que están haciendo daño a la información con clickbaits y contenidos erroneos por lo que os pide por favor que no sigáis compartiendo su contenido.\nSi os queréis informar de una forma veráz id a <#noticias_destacadas> y si no os gusta su contenido ayudad a <@190402725224251402> para que sepa que contenido es el que buscáis.\n\nMuchas gracias, Buen día :wave:');
    }

    if (message.channel.type.toLowerCase() === 'dm' || message.channel.type.toLowerCase() === 'group') {
        for (const channel of channels) {
            channel.send(message.content);
        }
    }
});
