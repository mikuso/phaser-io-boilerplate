const Phaser = require('phaser/dist/phaser.min.js');

const game = new Phaser.Game({
    width: 800, height: 450, // phone - landscape
    // width: 450, height: 800, // phone - portrait
    renderer: Phaser.AUTO,
    pixelArt: true,
    roundPixels: true,
    banner: false,
    disableContextMenu: true
});

game.scene.add('BootstrapScene', require('./scenes/bootstrap'));
game.scene.add('LoadingScene', require('./scenes/loading'));
// game.scene.add('GameScene', require('./scenes/game'));
// game.scene.add('EncounterScene', require('./scenes/encounter'));
// game.scene.add('UIScene', require('./scenes/ui'));
// game.scene.add('ResyncScene', require('./scenes/resync'));
// game.scene.add('DisconnectedScene', require('./scenes/disconnected'));

game.scene.start('BootstrapScene');
