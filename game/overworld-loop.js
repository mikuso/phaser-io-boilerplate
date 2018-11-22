const GameLoop = require('../lib/gameloop');

class OverworldLoop extends GameLoop {
    constructor(opts) {
        super(opts);
    }

    update() {
        // update game systems here
        // * inputs
        // * world simulation
        // * outputs
        console.log('Time @', this.getTime(), 'in', this.constructor.name);
    }

    startup() {
        super.startup()
        console.log('Loop started @', this.constructor.name);

        this.delay(2000, () => console.log("Timer triggered after 2 seconds (a)"));
        this.delay(2000, () => console.log("Timer triggered after 2 seconds (b)"));
        this.delay(2000, () => console.log("Timer triggered after 2 seconds (c)"));
        this.delay(1000, () => console.log("Timer triggered after 1 second"));
        this.delay(3000, () => console.log("Timer triggered after 3 seconds"));
        this.delay(3000, () => this.shutdown());
        this.delay(3000, () => console.log("Timer won't trigger because loop shut down"));
    }

    shutdown() {
        super.shutdown()
        console.log('Loop stopped @', this.constructor.name);
    }
}

module.exports = OverworldLoop;
