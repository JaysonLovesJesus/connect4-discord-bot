module.exports = {
	name: 'join',
	description: 'Joins an open room.',
    aliases: ['j'],
	execute(message, [id]) {
        const rooms = message.client.rooms.waiting;
        if (!id) {
            if (!rooms.length) return message.channel.send(`There isn't any open rooms`);
            id = rooms[rooms.length-1];
        }
        else if (id === "random") {
            if (!rooms.length) return message.channel.send(`There isn't any open rooms`);
            id = rooms[Math.floor(Math.random()*rooms.length)];
        }
        const room = message.client.rooms.get(id);
        if (!room) return message.channel.send(`Couldn't find a room with the id \`${id}\``);
        if (room.players.length === 1) {
            room.addPlayer(message.author.id);
            message.channel.send("Joining...").then(msg => {
                room.addMessage(msg);
                room.updateMessages(0, true);
            });
        }
	}
};