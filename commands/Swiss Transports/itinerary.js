const Discord = require("discord.js");
const superagent = require("superagent");

module.exports = {
  name: "itinerary",
  aliases: ["i"],
  category: "Swiss Transports",
  description: "Gives you the detail of an itinerary",
  usage: "++itinerary <from> <to>",
  run: async (bot,message,args) => {
      // Gets API infos
      let {body} = await superagent
      .get(`http://transport.opendata.ch/v1/connections?from=${args[0]}&to=${args[1]}`);

        // Converts date format
        if (body.connections[0]){
          var date = new Date(body.connections[0].from.departure),
          hours   = date.getHours(),
          minutes = date.getMinutes();

          var output  = ("0" + hours).slice(-2) + ':' + ("0" + minutes).slice(-2) + ' h';
        }
        // Creates the embed for error messages
        function DiscordError (ErrorString)
        {
          let errorembed = new Discord.RichEmbed()
          .setColor("RED")
          .setTitle("**ERROR! :**")
          .addField("**Issue :**", `${ErrorString}`)
          .setTimestamp()
          .setFooter("Usage : ++itinerary <from> <to>");
          message.channel.send(errorembed);
        }
        // Gives itinerary infos
        if (args[0] && args[1] && !args[2] && body.connections[0])
        {
          let timeembed = new Discord.RichEmbed()
          .setColor("#ff9900")
          .setTitle(`**__itinerary :__**`)
          .addField("**Itinerary info :**", `${args[0].toLowerCase()} to ${args[1].toLowerCase()}\nDeparture time : ${output}`)
          .addBlankField()
          .setThumbnail("https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/1ad2e474538729.5c361fd42e9a6.png")
          .setTimestamp()
          .setFooter("From transport.opendata.ch");

          // Adds all fields for stops, and checks if you need to walk or not.
          for (let i = 0; i < (body.connections[0].sections.length); i++) {
            if (body.connections[0].sections[i].walk)
            {
              timeembed.addField(`**#${i + 1} Stop, Walking time :**`, `${body.connections[0].sections[i].walk.duration / 60} minutes`, true)
              timeembed.addField(`Destination:`, `${body.connections[0].sections[i].arrival.station.name}`, true)
              timeembed.addBlankField()

            } else {
              timeembed.addField(`**#${i + 1} Stop, Transport Category :**`, `${body.connections[0].sections[i].journey.category}`, true)
              timeembed.addField(`Transport Number: :`, `${body.connections[0].sections[i].journey.number}`, true)
              timeembed.addField(`Transport Operator: :`, `${body.connections[0].sections[i].journey.operator}`, true)
              timeembed.addField(`Destination:`, `${body.connections[0].sections[i].journey.to}`, true)
              timeembed.addBlankField()
            }
          }
          message.channel.send(timeembed);

          // All possible error messages.
        } else if (!args[0] || !args[1] || args[2] || !body.connections[0]) {
          if (!args[0]) {
            var ErrorString = "You havent put any city names! Specify them after `++itinerary`";
          } else if (!args[1] || args[2]) {
            var ErrorString = "You need to put the name of **2** cities!";
          } else if (!body.connections[0]) {
            var ErrorString = "One of the name of your cities doesn't exist";
          }
          DiscordError(ErrorString);
        }
      }
}
