const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytsearch = require('yt-search');


exports.run = async(client, message, arg, prefix) => {
  Play(client, message, arg, prefix);
}

function Play(client, message, arg, prefix) {
  if (queue) {
    let voiceChannel = message.member.voiceChannel;
    if (voiceChannel) {
      voiceChannel.join().then((connection) => {
        let reg = new RegExp('https://youtube.com/');
        if (reg.test(arg[0])) {
          let stream = ytdl(arg[0], {filter: 'audioonly'});
          queue.push(stream);
          if (queue.length < 1) {
            PlayNext(queue, connection, message);
          } else {
            message.channel.send(`Added to queue: ${arg[0]}`);
          }
        } else {
          ytsearch(arg.join(" "), function(err, result) {
            if (err) return console.log('Error:\n', err);
            let topVid = `https://${result.videos[0].url}`;
            let stream = ytdl(topVid, {filter: 'audioonly'});
            function Song(name, stream) {
              this.name = name;
              this.stream = stream;
            }
            let newSong = new Song(result.videos[0].name, stream, length);
            queue.push(newSong);
            if (queue.length < 1) {
              PlayNext(queueu, connection, message);
            } else {
              message.channel.send(`Added to queue: ${result.videos[0].name}`);
            }
          });
        }
      })
    } else {
      message.channel.send('You need to be connected to a voice channel!');
    }
  } else {
    queue = [];
    Play(client, message, arg, prefix);
  }
}

function PlayNext(queue, connection, message) {
  if (queue.length < 1) {
    voiceChannel.leave();
    message.channel.send('No songs left to play~');
  } else {
    let dispatcher = connection.playStream(queue[0].stream);
    message.channel.send(`Now playing: ${queue[0].name}`);
    queue.shift();

    let filter = m => m.member.voiceChannel = message.member.voiceChannel;
    message.channel.createMessageCollector(filter);

    collector.on('collect', (m) => {
      let cmd = m.content.substr(prefix.length).split(' ')[0];
      switch(cmd) {
        case 'next':
        case 'skip':
          PlayNext(queue, connection, message);
        break;
        case 'song':
          message.channel.send(`${queue[0].name} | ${dispatcher.time}/${queue[0].length}`);
        break;
        case 'queue':
          let embed = new RichEmbed()
          .setColor('BLUE')
          .setAuthor('Azure');
          for (const song in queue) {
            embed.addField(song.name, song.length);
          }
          message.channel.send(embed);
        break;
        case 'clear':
        case 'die':
          dispatcher.end();
          queue = [];
          voiceChannel.leave();
          collector.end();
          message.react('⏹');
        break;
        case 'play':
          Play(client, message, arg, prefix);
        break;
        case 'pause':
        case 'resume':
          Pause(cmd, message);
        break;
      }
    });

    dispatcher.on('end', () => {
      PlayNext(queue, connection);
    });
  }
}

function Pause(cmd, message) {
  switch(cmd){
    case 'pause':
      if (dispatcher.paused) {
        dispatcher.resume();
        message.react('▶');
      } else {
        dispatcher.pause();
        message.react('⏸');
      }
    break;
    case 'resume':
      if (dispatcher.paused) {
        dispatcher.resume();
        message.react('▶');
      }
    break;
  }
}
