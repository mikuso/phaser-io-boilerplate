// The bootstrapper loads the initial assets needed for the Loader scene.
// This should be very lightweight, as we want to get out of here and show something real quick.

class BootstrapScene extends Phaser.Scene {
    create() {
        this.load.spritesheet({
            key: 'crystalball',
            url: 'assets/spritesheets/crystalball.png',
            frameConfig: {frameWidth: 36, frameHeight: 36}
        });

        this.load.on('complete', () => {
            this.scene.stop();
            this.scene.start('LoadingScene');
        });

        this.load.start();
    }
}

module.exports = BootstrapScene;
