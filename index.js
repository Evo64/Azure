const Discord = require('discord.js');
const { RichEmbed } = require('discord.js');
const level = require('level');
const fs = require('fs');
const settings = require('./settings.json');

const gDB = level('gDB');
const cDB = level('cDB');
const uDB = level('uDB');

const client = new Discord.Client();

client.on('ready', () => {
  console.log('Ready!');
  setInterval(function() {
    client.user.setActivity(`${client.guilds} servers | a!help`);
  }, 60000);
});

client.on('message', (message) => {
    // Prevents bot from responding to itself
  if (message.author.bot) return;
  gDB.get(message.guild.id, function(err, guildObj) {
    if (err) return console.log('An error occured!\n', err);
    let prefix = guildObj.prefix;
    if (message.content.startsWith(prefix)) {
      let cmd = message.content.substr(prefix.length).split(' ')[0];
      let arg = message.content.substr(prefix.length).split(' ').slice(1);
      cDB.get(cmd, function(err, cmdObj) {
        if (err) return;
        let file = require(cmdObj.path);
        file.run(cmdObj.req);
      });
    }
  });
});

client.on('guildCreate', (guild) => {
  gDB.get(guild.id, function(err, guildObj) {
    if (err) {
        // Finds general channel
      let defaultChannel = guild.channels.find('name', 'general');
      gDB.put(guild.id, 'a!', function(err) {
        if (err) {
            // If there was an error while joining
          defaultChannel.send('Uh oh! Somehow, an error occured while I joined. Please try reinviting me to the server!');
        } else {
            // When joined successfully
          let embed = new RichEmbed()
          .setAuthor('Azure Bot')
          .setTitle('Thank you for inviting me!')
          .addField('Configuration', 'My default prefix is `a!`. To view a list of my commands, use `a!help`. If you would like to change this, \
          use `a!prefix` to change it.')
          .addField('Support', 'Got bugs to report? Bot not working? Contact <@342141200108617728> for help!')
          .setColor('d0a4ff')
          defaultChannel.send(embed);
        }
      });
    } else {
        // If bot has already been in server
      let embed = new RichEmbed()
      defaultChannel.send(embed);
    }
  });
});

client.on('guildMemberAdd', (member) => {
  gDB.get(member.guild.id, function(err, guildObj) {
    if (guildObj.welcome_messages = true) {
      let welcomeChannel = guildObj.welcome_channel;
      welcomeChannel.send(guildObj.welcome_message);
    }
  });
});

function BotLogin(client) {
  let token = settings[prefix];
  client.login(token);
}
