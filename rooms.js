const { Message } = require("discord.js");

const rooms = (() => {
    const rooms = {},
    waiting = [],
    room = ((id, w, h) => {
        w = isNaN(w*1) ? 7 : w;
        h = isNaN(h*1) ? 6 : h;
        let turn = false, x;
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
            [],
            [],
            [],
        ].slice(0, w),
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
            for (let x = 0; x < board.length; x ++) {
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
        reactions = ["739235876785356811", "739235877133221998", "739235877271765123", "739235876135239699", "739235876399480894", "739235877124833361", "739235876814585858", "739235876135108698", "739235876416127018", "739235877410045972"].slice(0, w),
        redReactions = ["738936330964303943", "738936333640400917", "738936333841596516", "738936330901520494", "738936330414981122", "738936333774356580", "738936332927369306", "739231139188703340", "739231141479055482", "739231145945727066"].slice(0, w),
        yellowReactions = ["738936333397131325", "738936333413908503", "738936333711573022", "738936333317439580", "738936333824819251", "738936333476823122", "738936333636075570", "739231145899720764", "739231145497067591", "739231145811640474"].slice(0, w),
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
                    const reaction = collected.first();
                    x = reactions.indexOf(reaction.emoji.id);
                    if (board[x].length > h) return;
                    const userReactions = messages[(turn*1+1)%messages.length].reactions.cache.find(r => r.emoji.id === reaction.emoji.id).users;
                    try {
                        reaction.users.remove(players[turn*1]);
                    } catch(e) {}
                    addPiece(turn*1, x);
                    if (board[x].length >= h) {
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
            const m = msg.edit(getPieces(msg, over, x));
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
        getPieces = (msg, over, X) => {
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
            const pieces = ["<:red:738916010480107582>","<:yellow:738916010673045555>","<:blue:738916280937086996>","<:blue2:738939883221024792>"];
            let s = `**Room ${id}**\n`;
            s += turn
                ? `<:a:${yellowReactions.join("><:a:")}>`
                : `<:a:${redReactions.join("><:a:")}>`
            for (let y = h-1; y >= 0; y --) {
                s += "\n";
                for (let x = 0; x < w; x ++) {
                    s += pieces[getPiece(x, y)+1 ? getPiece(x, y) : X == x ? 3 : 2];
                }
            }
            s += `\n\n<:red2:738916825290768455> ${msg.client.users.cache.get(players[0])} (${msg.client.users.cache.get(players[0]).tag}) **${status[0]}**`;
            s += `\n<:yellow2:738916825768919080> ${msg.client.users.cache.get(players[1])} (${msg.client.users.cache.get(players[1]).tag}) **${status[1]}**`;
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
    create = (message, w, h) => {
        const id = Math.random().toString(36).slice(2, 6).toUpperCase(),
            r = room(id, w, h);
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