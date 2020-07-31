module.exports = {
	name: 'invite',
	description: 'Invite Connect 4 to your own server!',
	usage: [],
    aliases: [],
	execute(message) {
        message.channel.send({ embed: {
			title: "Click here to invite me to your server", 
			url: "https://discord.com/api/oauth2/authorize?client_id=736350110660821094&permissions=272448&scope=bot"
		} });
	}
};