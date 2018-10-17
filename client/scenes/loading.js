const net = require('../systems/net');

class LoadingScene extends Phaser.Scene {
    init() {
        net.hook(this);
    }

    create() {
        this.add.text(90, 90, 'LOADING')
    }
}

module.exports = LoadingScene;
