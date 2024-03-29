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
            this.anims.create({
                key: 'crystalballAnim',
                frames: this.anims.generateFrameNumbers('crystalball', { start: 0, end: 15 }),
                frameRate: 16,
                repeat: -1
            });

            this.scene.stop();
            this.scene.start('LoadingScene');
        });

        this.load.start();
    }
}

module.exports = BootstrapScene;
