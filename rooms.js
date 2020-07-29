const { Message } = require("discord.js");

const rooms = (() => {
    const rooms = {},
    waiting = [],
    room = (id => {
        let turn = false;
        const players = [],
        messages = [],
        spectators = [],
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
        reactions = ["737794168063131770", "737794168277041162", "737794168436293695", "737794166716891279", "737794166800777246", "737794237742973059", "737794168096817233"],
        filter = (reaction, user) => {
            return reactions.includes(reaction.emoji.id) && players[turn*1] === user.id;
        },
        react = async msg => {
            msg.reactions.removeAll();
            for (const i of reactions) {
                await msg.react(i);
            }
        },
        update = async (msg, won) => {
            waiting.splice(waiting.indexOf(id), 1);
            const over = won || checkWin(),
            awaitReactions = m => {
                if (over) return m;
                m.awaitReactions(filter, { max: 1, time: 1000*60*3, errors: ["time"] })
                .then(async collected => {
                    const reaction = collected.first(),
                    x = reactions.indexOf(reaction.emoji.id);
                    if (board[x].length > 6) return;
                    const userReactions = messages[(turn*1+1)%messages.length].reactions.cache.find(r => r.emoji.id === reaction.emoji.id).users;
                    try {
                        reaction.users.remove(players[turn*1]);
                    } catch(e) {}
                    addPiece(turn*1, x);
                    if (board[x].length >= 6) {
                        await reaction.users.remove(m.client.user.id);
                        await userReactions.remove(m.client.user.id);
                    }
                    turn = !turn;
                    updateMessages();
                })
                .catch(collected => {
                    updateMessages(4);
                });
                return m;
            };
            const m = msg.edit(getPieces(msg, over));
            if ((turn*1)%messages.length === messages.indexOf(msg)) {
                m.then(awaitReactions);
            }
            if (over) {
                delete rooms[id];
            }
        },
        updateSpectate = (msg, won) => {
            msg.edit(getPieces(msg, won || checkWin()));
        },
        updateMessages = (won, first, spectate) => {
            if (!spectate) {
                for (const msg of messages) {
                    update(msg, won);
                    if (first) react(msg);
                }
            }
            for (const spectator of spectators) {
                updateSpectate(spectator, won);
            }
        },
        addPiece = (id, x) => {
            board[x].push(id);
        },
        getPiece = (x, y) => {
            return board[x][y];
        },
        getPieces = (msg, over) => {
            let status = [];
            if (!over) {
                status = turn ? ["Next", "Now"] : ["Now", "Next"];
            } else if (over < 3) {
                status = over-1 ? ["Lost", "Won"] : ["Won", "Lost"];
            } else if (over === 3) {
                status = ["Tie", "Tie"]
            } else {
                status = turn ? ["Won | Timeout", "Lost | Timeout"] : ["Lost | Timeout", "Won | Timeout"];
            }
            const pieces = ["🔴","🔵","⚫"];
            let s = `**Room ${id}**\n<:1_:737794168063131770><:2_:737794168277041162><:3_:737794168436293695><:4_:737794166716891279><:5_:737794166800777246><:6_:737794237742973059><:7_:737794168096817233>`;
            for (let y = 5; y >= 0; y --) {
                s += "\n";
                for (let x = 0; x < 7; x ++) {
                    s += pieces[getPiece(x, y)+1 ? getPiece(x, y) : 2];
                }
            }
            s += `\n\n🔴 ${msg.client.users.cache.get(players[0])} (${msg.client.users.cache.get(players[0]).tag}) **${status[0]}**`;
            s += `\n🔵 ${msg.client.users.cache.get(players[1])} (${msg.client.users.cache.get(players[1]).tag}) **${status[1]}**`;
            return s;
        },
        addPlayer = id => {
            players.push(id);
        },
        addSpectator = message => {
            spectators.push(message);
        },
        addMessage = msg => {
            if (messages.length && msg.channel.id === messages[0].channel.id) {
                messages.splice(0, 1);
            }
            messages.push(msg);
        };
        return {
            get id() {
                return id;
            },
            players: players,
            update: update,
            updateMessages: updateMessages,
            addPlayer: addPlayer,
            addSpectator: addSpectator,
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
    },
    destroy = id => {
        delete rooms[id];
    };
    return {
        get: id => {
            return rooms[id.toUpperCase()];
        },
        rooms: rooms,
        waiting: waiting,
        create: create,
        destroy: destroy,
    };
})();
module.exports = rooms;