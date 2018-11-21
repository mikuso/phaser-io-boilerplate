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
            this.emit('client.disconnected', client);
        });

        this.clients.add(client);
        this.emit('client.connected', client);
    }

    async startup() {
        this._log(`Starting up game server`);
    }

    async shutdown() {
        this._log(`Shutting down game server`);
    }

    _log(...args) {
		console.log(chalk.blue.bold(`[GameServer]`), ...args);
	}
}

module.exports = GameServer;
