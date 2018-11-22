const chalk = require('chalk');
const EventEmitter = require("eventemitter3");
const Client = require('./client');

class GameServer extends EventEmitter {
    constructor({webserver}) {
        super();
        this.clients = new Set();
        this.webserver = webserver;
        this.webserver.on('websocket', this.onWebsocketConnected, this);
    }

    onWebsocketConnected(sock) {
        let client = new Client(this, sock);

        sock.once('close', () => {
            this.clients.delete(client);
            this.emit('client.disconnect', client);
        });

        this.clients.add(client);
        this.emit('client.connect', client);
    }

    async startup() {
        this.log(`Starting up game server`);
        this.emit('startup');

        // start webserver
        await this.webserver.startup({
            listenPort: process.env.PORT || 3064
        });
    }

    async shutdown() {
        this.log(`Shutting down game server`);
        this.emit('shutdown');
        await this.webserver.shutdown();
    }

    log(...args) {
		console.log(chalk.blue.bold(`[GameServer]`), ...args);
	}
}

module.exports = GameServer;
