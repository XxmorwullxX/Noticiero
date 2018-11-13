const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);

let channelList = ['190818265923059712', '457922428883042315', '494757740292603904'];
let channels = [];

function frasesvandal() {
  var rand = ['¿Has considerado dejar de entrar en una web que promueve activamente el clickbait como lo es Vandal?', 
              'Sé que esto te sonará extraño pero por favor, mi dueño me puso aquí no solo para facilitarle el trabajo sino para ofreceros información de calidad',
              'Por favor, considera dejar de entrar en Vandal y mirate #noticias_destacadas, si ves que la información no te agrada considera colaborar con Mor',
              '🛑 Eso es un enlace de Vandal, por favor, no ensucies el server con eso 🛑', 
              'https://i.imgflip.com/2mh8up.jpg'];

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
      message.channel.send(frasesvandal());
    }

    if (message.channel.type.toLowerCase() === 'dm' || message.channel.type.toLowerCase() === 'group') {
        for (const channel of channels) {
            channel.send(message.content);
        }
    }
});
