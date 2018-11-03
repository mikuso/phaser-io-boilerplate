const chalk = require('chalk');
const EventEmitter = require("eventemitter3");
const Player = require('./player');
const netMessages = require('../shared/net-messages');

class GameServer extends EventEmitter {
    constructor({webserver, netMessages}) {
        super();
        this.players = new Set();
        this.webserver = webserver;
        this.webserver.on('websocket', this.onWebsocketConnected, this);
    }

    onWebsocketConnected(sock) {
        let player = new Player(this, sock);

        sock.once('close', () => {
            this.players.delete(player);
            this.emit('player.disconnected', player);
        });

        this.players.add(player);
        this.emit('player.connected', player);
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
