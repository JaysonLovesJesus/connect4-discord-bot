module.exports = {
	name: "spectate",
	description: "Spectate a given or random room. Other wise gives a list of rooms.",
    usage: ["", "<id>", "random"],
    aliases: ["spec"],
	execute(message, [id]) {
        const rooms = message.client.rooms.rooms;
        if (!id) {
            if (!rooms) return message.channel.send(`There isn't any open rooms`);
            const embed = new message.client.embed()
            .setColor("#4287f5")
            .setTitle("Curretly Active Rooms");
            for (const i in rooms) {
                const room = rooms[i];
                embed.addField(`Room ${room.id}`, `Players: ${room.players.map(id => message.client.users.cache.get(id).tag).join(", ")}`);
            }
            return message.channel.send(embed);
        } else if (id === "random") {
            if (!rooms) return message.channel.send(`There isn't any open rooms`);
            const keys = Object.keys(rooms);
            id = keys[Math.floor(Math.random()*keys.length)];
        }
        const room = message.client.rooms.get(id);
        if (!room) return message.channel.send(`Couldn't find a room with the id \`${id}\``);
        message.channel.send("Joining...").then(msg => {
            room.addSpectator(msg);
            room.updateMessages(0, 0, 1);
        });
	}
};