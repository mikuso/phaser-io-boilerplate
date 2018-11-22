const chalk = require('chalk');
const EventEmitter = require("eventemitter3");
const Client = require('./client');

class GameServer extends EventEmitter {
    constructor({webserver}) {
        super();
        this.clients = new Set();
        this.webserver = webserver;
        this.webserver.on('websocket', this.onWebsocketConnected, this);

        this.on('client.connect', this.onClientConnect, this);
        this.on('client.disconnect', this.onClientDisconnect, this);
        this.on('startup', this.onStartup, this);
        this.on('shutdown', this.onShutdown, this);
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
    }

    async shutdown() {
        this.log(`Shutting down game server`);
        this.emit('shutdown');
    }

    log(...args) {
		console.log(chalk.blue.bold(`[GameServer]`), ...args);
	}

    onClientConnect(client) { /* to be implemented by subclass */ }
    onClientDisconnect(client) { /* to be implemented by subclass */ }
    onStartup() { /* to be implemented by subclass */ }
    onShutdown() { /* to be implemented by subclass */ }
}

module.exports = GameServer;
