const Phaser = require('phaser/dist/phaser.min.js');

const game = new Phaser.Game({
    width: 800, height: 600, // default
    // width: 450, height: 800, // phone - portrait
    renderer: Phaser.AUTO,
    pixelArt: true,
    roundPixels: true,
    banner: false,
    disableContextMenu: true,
    callbacks: {postBoot}
});

game.scene.add('BootstrapScene', require('./scenes/bootstrap'));
game.scene.add('LoadingScene', require('./scenes/loading'));
game.scene.add('MenuScene', require('./scenes/menu'));

game.scene.start('BootstrapScene');
