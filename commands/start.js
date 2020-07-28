module.exports = {
	name: 'start',
	description: 'Starts a game of connect 4.',
    aliases: ['s'],
	execute(message, [id]) {
        const room = message.client.rooms.create(message);
        room.addPlayer(message.author.id);
        if (id) {
            const user = client.users.get(id.replace(/[^0-9]/g, ''));
            if (!user) message.channel.send(`Couldn't find user ${id}`);
            message.channel.send(`${user}, ${message.author.tag} `);
        } else {
            message.channel.send(`Created room!\nType \`${message.client.prefix}join ${room.id}\` to join the game.\n\n**Participants**\n${message.author.username}`).then(msg => {
                room.addMessage(msg);
            });
        }
	}
};