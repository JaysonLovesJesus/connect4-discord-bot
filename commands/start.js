module.exports = {
	name: "start",
	description: "Starts a game of connect 4.",
    usage: ["@user"],
    aliases: ["s"],
	execute(message, args) {
        let [width, height, id] = args;
        if (width && height) {
            if (width < 4 && width > 10) return message.channel.send("Please pick a width between 4 and 10");
            if (height < 4 && height > 10) return message.channel.send("Please pick a height between 4 and 10");
        }
        id = !id && !height ? width : id;
        if (id) {
            const { user } = message.guild.members.cache.get(id.replace(/[^0-9]/g, ""));
            if (!user) return message.channel.send(`Couldn't find user ${id}`);
            message.channel.send(`${user}, ${message.author.tag} has challenged you to a duel`).then(msg => {
                msg.react("👍").then(() => msg.react("👎"));
                msg.awaitReactions((reaction, reactionUser) => ["👍", "👎"].includes(reaction.emoji.name) && reactionUser.id === user.id, { max: 1, time: 1000*60*2, errors: ["time"] })
                    .then(collected => {
                        const reaction = collected.first(); 
                        if (reaction.emoji.name === "👍") {
                            const room = message.client.rooms.create(message, width, height);
                            room.addPlayer(message.author.id);
                            room.addPlayer(user.id);
                            room.addMessage(msg);
                            room.updateMessages(0, true);
                        } else {
                            message.channel.send(`${user.tag} has refused to duel with ${message.author.tag}`);
                            message.client.rooms.destroy(room.id);
                        }
                    })
                    .catch(collected => {
                        console.log(collected);
                        message.reply(`${user.tag} has waited too long to respond.`);
                    });
            }); 
        } else {
            const room = message.client.rooms.create(message, width, height);
            room.addPlayer(message.author.id);
            message.channel.send(`Created room!\nType \`${message.client.prefix}join ${room.id}\` to join the game.\n\n**Participants**\n${message.author.username}`).then(msg => {
                room.addMessage(msg);
            });
        }
	}
};