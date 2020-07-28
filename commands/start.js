module.exports = {
	name: 'start',
	description: 'Starts a game of connect 4.',
    aliases: ['s'],
	execute(message, [id]) {
        const room = message.client.rooms.create(message);
        room.addPlayer(message.author.id);
        if (id) {
            const user = message.guild.users.cache.get(id.replace(/[^0-9]/g, ''));
            if (!user) message.channel.send(`Couldn't find user ${id}`);
            message.channel.send(`${user}, ${message.author.tag} has challenged you to a duel`).then(msg => {
                msg.awaitReactions((reaction, reactionUser) => ['👍', '👎'].includes(reaction.emoji.name) && reactionUser.id === user.id, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
                    if (reaction.emoji.name === '👍') {
                        room.addPlayer(user.id);
                    } else {
                        message.channel.send(`${user.tag} has refused to duel with ${message.author.tag}`);
                        message.client.rooms.destroy(room.id);
                    }
                });
                msg.react('👍').then(() => msg.react('👎'));
            });
        } else {
            message.channel.send(`Created room!\nType \`${message.client.prefix}join ${room.id}\` to join the game.\n\n**Participants**\n${message.author.username}`).then(msg => {
                room.addMessage(msg);
            });
        }
	}
};