module.exports = {
	name: 'start',
	description: 'Starts a game of connect 4.',
    aliases: ['s'],
	execute(message) {
        const room = message.client.rooms.create(message);
        room.addPlayer(message.author.id);
        message.channel.send(`Created room!\nType \`${message.client.prefix}join ${room.id}\` to join the game.\n\n**Participants**\n${message.author.username}`).then(msg => {
            room.addMessage(msg);
        });
	}
};