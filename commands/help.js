module.exports = {
	name: 'help',
    description: 'List all of my commands or info about a specific command.',
    usage: [`<command>`],
	aliases: ['commands'],
	execute(message, args) {
        const { commands } = message.client;

        if (!args.length) {
            const embed = new message.client.embed()
            .setColor("#4287f5")
            .setTitle("Here's a list of my commands")
            .setFooter(`Made by JSON#8975`, "https://cdn.discordapp.com/avatars/359988404316012547/ba538e9e7118a35166d071daa9e23f74.png");

            commands.forEach(command => {
                embed.addField(message.client.prefix+command.name, command.description);
            });
    
            return message.channel.send(embed);
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) return message.channel.send(`${args[0]} isn's not a valid command`);

        const embed = new message.client.embed()
        .setColor("#4287f5")
        .setTitle(command.name.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()))
        .addField(`Description`, command.description)
        .setFooter(`Made by JSON#8975`, "https://cdn.discordapp.com/avatars/359988404316012547/ba538e9e7118a35166d071daa9e23f74.png");
        if (command.aliases.length) embed.addField(`Aliases`, command.aliases.join(", "))
        if (command.usage.length) embed.addField(`Usage`, message.client.prefix+command.name+" "+command.usage.join("\n"+message.client.prefix+command.name+" "))
        message.channel.send(embed);
	},
};