// The bootstrapper loads the initial assets needed for the Loader scene.
// This should be very lightweight, as we want to get out of here and show something real quick.

class BootstrapScene extends Phaser.Scene {
    create() {
        this.add.text(50,50,'BOOTING');
    }
}

module.exports = BootstrapScene;
