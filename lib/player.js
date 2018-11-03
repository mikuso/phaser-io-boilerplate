const EventEmitter = require("eventemitter3");
const netMessages = require('../shared/net-messages');

class Player extends EventEmitter {
    constructor(game, socket) {
        super();

        this.game = game;
        this.socket = socket;

        this.socket.on('message', (buffer) => {
            try {
                const {id, data} = netMessages.decode(buffer);
                const def = netMessages.client[id];
                if (!def) {
                    throw Error(`Unknown message ID: ${id}`);
                }
                const msg = def.schema.decode(data);
                this.onMessage(msg, def);
            } catch (err) {
                console.error('bad socket message', err);
                this.socket.terminate();
            }
        });
    }

    onMessage(msg, def) {
        console.log('client message received', msg, def);
        // this.socket.send(
        //     netMessages.encode({
        //         id: 0,
        //         data: def.schema.encode({token: "123456"})
        //     })
        // );

    }

}

module.exports = Player;
