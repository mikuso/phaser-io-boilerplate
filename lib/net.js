const netMessages = require('../shared/net-messages');

const net = {};

net.to = function(players){
    if (!players[Symbol.iterator]) {
        players = [players];
    }

    // return sendTo.bind(players);
};

class NetWrapper {
    constructor(socket) {
        this.socket = socket;
    }
}

for (const def of netMessages.server) {

    // broadcast function
    net[def.key] = function(data, players) {
        if (!players[Symbol.iterator]) {
            players = [players];
        }

        const message = netMessages.encode({
            id: def.id,
            data: def.schema.encode(data)
        });

        for (const player of players) {
            try {
                player.socket.send(message);
            } catch (err) {
                console.error(`Error broadcasting message`, err);
            }
        }
    };

    // wrapped method
    NetWrapper.prototype[def.key] = function(data){
        this.socket.send(
            netMessages.encode({
                id: def.id,
                data: def.schema.encode(data)
            })
        );
    };
}

net.Wrapper = NetWrapper;

module.exports = net;
