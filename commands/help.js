module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	execute(message, args) {
        const { commands } = message.client;

        // if (!args.length) {
            const embed = new message.client.embed()
            .setColor("#4287f5")
            .setTitle("Here's a list of my commands");

            commands.forEach(command => {
                embed.addField(message.client.prefix+command.name, command.description);
            });
    
            return message.channel.send(embed);
        // }
	},
};