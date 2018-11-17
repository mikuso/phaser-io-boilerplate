// The bulk of the asset loading should be performed here.

class LoadingScene extends Phaser.Scene {
    create() {
        this.add.text(90, 90, 'LOADING')
    }
}

module.exports = LoadingScene;
