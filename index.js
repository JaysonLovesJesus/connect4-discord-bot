require('dotenv').config();
const fs = require('fs'),
	Discord = require('discord.js'),
	client = new Discord.Client();
client.commands = new Discord.Collection();
client.embed = Discord.MessageEmbed;
client.prefix = process.env.PREFIX;

const rooms = require("./rooms");
client.rooms = rooms;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log(`Ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} guilds`);
	client.user.setActivity(`for ${process.env.PREFIX}help in ${client.guilds.cache.size} servers`, { type: 'WATCHING' });
});

client.on('message', message => {
	if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
	}
});

client.login(process.env.CLIENT_TOKEN);