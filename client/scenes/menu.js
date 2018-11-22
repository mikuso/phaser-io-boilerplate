const net = require('../systems/net');

class MenuScene extends Phaser.Scene {
    init() {
        net.hook(this);
    }

    create() {
        this.add.image(0, 0, 'bg').setOrigin(0,0);

        net.auth({username: "guest", password: "guest"})
    }

    [net.auth_granted]({token}) {
        console.log('received token:', token);
    }
}

module.exports = MenuScene;
