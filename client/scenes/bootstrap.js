const net = require('../systems/net');

// The bootstrapper loads the initial assets needed for the Loader scene.
// This should be very lightweight as we can't even display a loading bar yet

class BootstrapScene extends Phaser.Scene {
    init() {
        net.hook(this);
    }

    create() {
        // this.load.spritesheet("throbber", "images/misc/throbber.png", {frameWidth: 44, frameHeight: 44});
        // console.log(this.net);

        net.auth({username: 'abc', password: 'test'});
        // let b = new ArrayBuffer(10);
        // net.auth(b);
        this.add.text(50,50,'BOOTING')
    }

    update(clock, delta) {
        // this.net.update(this);
        // console.log('scene udpate');
    }

    [net.auth_granted]({token}) {
        console.log('auth granted!', token);
    }

    [net.auth_denied]({reason}) {
        this.scene.start('LoadingScene', {reason});
        // this.scene.start('DisconnectedScene', {reason: "Authentication Failed"});
    }

    [net.onDisconnect]() {
        console.log('disconnected');
    }
}

module.exports = BootstrapScene;
