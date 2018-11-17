// The bulk of the asset loading should be performed here.

const assets = {
    bitmapFonts: [],
    spritesheets: [],
    images: [
        ['bg', 'assets/images/bg.jpg']
    ],
    audio: []
};

class LoadingScene extends Phaser.Scene {
    create() {

        const cam = this.cameras.main;
        const hw = cam.width/2, hh = cam.height/2

        this.add.text(hw, hh + 25, 'LOADING', {
            fontFamily: 'Arial',
            fontSize: '12px'
        }).setOrigin(0.5, 0);

        this.add.sprite(hw, hh, 'crystalball')
            .play('crystalballAnim');

        this.add.rectangle(hw, hh + 56, 70, 12, 0xffffff);
        this.add.rectangle(hw, hh + 56, 68, 10, 0x000000);
        let loadbar = this.add.rectangle(hw - 66/2, hh + 56, 1, 8, 0xffffff).setOrigin(0, 0.5);

        this.load.on('fileprogress', (file, pct) => {
            loadbar.width = pct * 66;
        });

        this.load.on('complete', this.loaded, this);

        for (const asset of assets.bitmapFonts) { this.load.bitmapFont(...asset); }
        for (const asset of assets.spritesheets) { this.load.spritesheet(...asset); }
        for (const asset of assets.images) { this.load.image(...asset); }
        for (const asset of assets.audio) { this.load.audio(...asset); }
        this.load.start();
    }

    loaded() {
        // a useful spot to add animations here, now that all images & spritesheets are loaded

        // elsewise, let's go to the next scene
        this.scene.stop();
        this.scene.start("MenuScene");
    }
}

module.exports = LoadingScene;
