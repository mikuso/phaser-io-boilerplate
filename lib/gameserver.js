const chalk = require('chalk');
const EventEmitter = require("eventemitter3");
const Player = require('./player');

class GameServer extends EventEmitter {
    constructor({webserver, netMessages}) {
        super();

        this.webserver = webserver;
        // this.playerNetworker = new PlayerNetworker(netMessages);

        this.webserver.on('websocket', this.onWebsocketConnected, this);
    }

    onWebsocketConnected(sock) {
        let player = new Player(this);
        // this.playerNetworker.hook(player, sock);

        sock.on('x', (...args) => {
            this._log('client message recd', ...args);
        })
        // sock.once('disconnect', () => player.net.unhook());

        // player.switchState(LoadingState);
        // player.auth_granted();

        // this._log('new sock');
        // sock.emit('x', 123)
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
