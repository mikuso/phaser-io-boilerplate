const EventEmitter = require("eventemitter3");
const netMessages = require('../shared/net-messages');
const net = require('./net');
const NetWrapper = net.Wrapper;

class Client extends EventEmitter {
    constructor(game, socket) {
        super();

        this.game = game;
        this.socket = socket;
        this.net = new NetWrapper(this.socket);

        this.socket.once('close', this.onDisconnect.bind(this));
        this.socket.on('message', this.onMessage.bind(this));
    }

    onMessage(buffer) {
        try {
            const {id, data} = netMessages.decode(buffer);
            const def = netMessages.client[id];
            if (!def) {
                throw Error(`Unknown message ID: ${id}`);
            }
            const msg = def.schema.decode(data);
            this.emit(def.key, msg);
        } catch (err) {
            this.socket.terminate();
        }
    }

    onDisconnect(code, reason) {

    }
}

module.exports = Client;
