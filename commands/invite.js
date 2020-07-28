module.exports = {
	name: 'invite',
	description: 'Invite Connect 4 to your own server!',
	usage: [],
    aliases: [],
	execute(message) {
        message.channel.send("Use this link to invite me to your server\nhttps://discord.com/api/oauth2/authorize?client_id=736350110660821094&permissions=10304&scope=bot");
	}
};