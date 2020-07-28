const { Message } = require("discord.js");

const rooms = (() => {
    const rooms = {},
    waiting = [],
    room = (id => {
        let turn = false;
        const players = [],
        messages = [],
        board = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ],
        checkWin = () => {
            const check = (x, y, stepX, stepY) => {
                let X = x, Y = y, j = 1;
                for (let i = 0; i < 4; i ++) {
                    let a = (board[X] && !Number.isNaN(board[X][Y]*1));
                    if (!a) return false;
                    a += board[X][Y];
                    X += stepX;
                    Y += stepY; 
                    j *= a*1;
                }
                return j === 1 ? 1 : j === 16 ? 2 : 0;
            };
            let i = 0;
            for (let x = 0; x < 7; x ++) {
                if (board[x].length) {
                    i += board[x].length;
                    for (let y = 0; y < board[x].length; y ++) {
                        const c = check(x, y, -1, 0) + check(x, y, -1, -1) + check(x, y, 0, -1) + check(x, y, 1, -1);
                        if (c) {
                            return c;
                        }
                    }
                }
            }
            return i === 42 ? 3 : 0;
        },
        update = async (message, won) => {
            waiting.splice(waiting.indexOf(id), 1);
            const over = won || checkWin(),
            reactions = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣"],
            filter = (reaction, user) => {
                return reactions.includes(reaction.emoji.name) && players[turn*1] === user.id;
            },
            react = async msg => {
                for (const i of reactions) {
                    await msg.react(i);
                }
                return msg;
            },
            awaitReactions = m => {
                if (over) return m;
                m.awaitReactions(filter, { max: 1, time: 1000*60*2, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first(),
                    x = reactions.indexOf(reaction.emoji.name);
                    if (board[x].length > 6) return;
                    try {
                        reaction.users.remove(players[turn*1]);
                    } catch(e) {}
                    addPiece(turn*1, x);
                    if (board[x].length >= 6) {
                        reactions.splice(x, 1);
                        reaction.users.remove(message.client.user.id);
                    }
                    turn = !turn;
                    updateMessages();
                })
                .catch(collected => {
                    updateMessages(!turn+1);
                    m.channel.send(`**Room ${id}** closed due to inactivity`);
                });
                return m;
            };
            const m = message.edit(getPieces(message, over));
            if ((turn*1)%messages.length === messages.indexOf(message)) {
                m.then(awaitReactions);
            }
            m.then(react);
            if (over) {
                delete rooms[id];
            }
        },
        updateMessages = (won) => {
            for (const message of messages) update(message, won);
        },
        addPiece = (id, x) => {
            board[x].push(id);
        },
        getPiece = (x, y) => {
            return board[x][y];
        },
        getPieces = (message, over) => {
            const pieces = ["🔴","🔵","⚫"];
            let s = `**Room ${id}**\n1⃣2⃣3⃣4⃣5⃣6⃣7⃣`;
            for (let y = 5; y >= 0; y --) {
                s += "\n";
                for (let x = 0; x < 7; x ++) {
                    s += pieces[getPiece(x, y)+1 ? getPiece(x, y) : 2];
                }
            }
            s += `\n\n🔴 ${message.client.users.cache.get(players[0]).tag} **${over==3?"Tie":over?over-1?"Lost":"Won":turn?"Next":"Now"}**`;
            s += `\n🔵 ${message.client.users.cache.get(players[1]).tag} **${over==3?"Tie":over?over-1?"Won":"Lost":turn?"Now":"Next"}**`;
            return s;
        },
        addPlayer = id => {
            players.push(id);
        },
        addMessage = message => {
            if (messages.length && message.channel.id === messages[0].channel.id) {
                messages.splice(0, 1);
            }
            messages.push(message);
        };
        return {
            get id() {
                return id;
            },
            players: players,
            update: update,
            updateMessages: updateMessages,
            addPlayer: addPlayer,
            addMessage: addMessage,
            addPiece: addPiece,
            getPieces: getPieces,
            create: create
        };
    }),
    create = message => {
        const id = Math.random().toString(36).slice(2, 6).toUpperCase(),
            r = room(id);
        rooms[id] = r;
        waiting.push(id);
        setTimeout(() => {
            if (rooms[id] && rooms[id].players.length < 2) {
                delete rooms[id];
                waiting.splice(waiting.indexOf(id), 1);
                message.channel.send(`**Room ${id}** closed due to inactivity`);
            }
        }, 1000*60*2);
        return r;
    };
    return {
        get: id => {
            return rooms[id.toUpperCase()];
        },
        rooms: rooms,
        waiting: waiting,
        create: create,
    };
})();
module.exports = rooms;