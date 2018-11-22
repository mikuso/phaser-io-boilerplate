const OverworldLoop = require('./overworld-loop');
const GameServer = require('../lib/gameserver');

class Core extends GameServer {
    constructor(opts) {
        super(opts);

        // inherited members
        this.clients; // Set() of all connected clients
        this.webserver; // the WebServer instance

        // a single game loop, for a single world/simulation
        // (if you need to run many game worlds simultaneously, you'll need a bunch of these)
        this.loop = new OverworldLoop({framerate: 1});
    }

    onClientConnect(client) {
        this.log('client connected', client.id);
        client.net.auth_granted({token: client.id});
    }

    onClientDisconnect(client) {
        this.log('client disconnected', client.id);
    }

    onStartup() {
        this.loop.startup();
    }

    onShutdown() {
        this.loop.shutdown();
    }
}

module.exports = Core;
