const OverworldLoop = require('./overworld-loop');
const GameServer = require('../lib/gameserver');

class Core extends GameServer {
    constructor(opts) {
        super(opts);

        // inherited
        this.clients; // a Set() of all connected clients
        this.webserver; // the WebServer instance

        // Let's create a game loop for a single world/simulation
        // (if you need to run many game worlds simultaneously, you'll need a bunch of these)
        this.loop = new OverworldLoop({framerate: 5});

        // let's listen for clients coming and going
        this.on('client.connect', this._onClientConnect, this);
        this.on('client.disconnect', this._onClientDisconnect, this);
    }

    _onClientConnect(client) {
        this.log('client connected:', client.id);

        client.on('auth', ({username, password}) => {
            client.net.auth_granted({token: username + ':' + client.id});
        });
    }

    _onClientDisconnect(client) {
        this.log('client disconnected:', client.id);
    }

    async startup() {
        this.loop.startup();
        return super.startup();
    }

    async shutdown() {
        this.loop.shutdown();
        return super.shutdown();
    }
}

module.exports = Core;
