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
            .setTitle("Here's a list of my commands");

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
        .addField(`Aliases`, command.aliases.join(", "))
        .addField(`Description`, command.description)
        .addField(`Usage`, message.client.prefix+command.name+" "+command.usage.join(", "+message.client.prefix+command.name+" "));
        message.channel.send(embed);
	},
};