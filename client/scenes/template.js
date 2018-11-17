const net = require('../systems/net');

class TemplateScene extends Phaser.Scene {
    init() {
        /**
         * Initiate a websocket connection and hook the netcode into the scene.
         * Once the scene unloads, it will automatically unhook.
         * Optionally, you can call net.unhook(this) to remove network functionality.
         */
        net.hook(this);
    }

    create() {
        // add some text to the scene
        this.add.text(50,50,'Example');

        /**
         * Send an auth packet from client -> server.
         * You do not need to wait for the websocket to be connected (the message will be queued)
         */
        net.auth({username: 'abc', password: 'test'});
    }

    /**
     * Method executed when the auth_granted packet is received from server.
     */
    [net.auth_granted]({token}) {
        console.log('SC:auth_granted', token);
    }

    /**
     * Method executed when the auth_denied packet is received from server.
     */
    [net.auth_denied]({reason}) {
        console.log('SC:auth_denied', reason);
    }

    /**
     * Executed when the websocket disconnects.
     * Can be called multiple times if, say, websocket reconnects and disconnects again.
     * Will not trigger in event of initial connection failure (e.g. if server is down)
     * (see net.onError to detect initial connection errors)
     * Note that the websocket will attempt to automatically reconnect after a moment.
     */
    [net.onDisconnect](evt) {
        console.log('SC:disconnected', evt);
    }

    /**
     * Executed when websocket is connected.
     * Can be called multiple times if, say, websocket reconnects after a connection drop-out.
     */
    [net.onConnect](evt) {
        console.log('SC:connected', evt);
    }

    /**
     * Executed when the websocket encounters an error.
     * Usually seen when the websocket cannot make an initial connection (or reconnection)
     */
    [net.onError](err) {
        console.log('SC:error', err);
    }
}

module.exports = TemplateScene;
