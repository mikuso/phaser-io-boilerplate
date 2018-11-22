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
        console.log('timestep', this.getTime());
    }

    startup() {
        super.startup()
        console.log('overworld loop started');
        
        this.delay(1000, () => console.log("After 1 second"));
        this.delay(2000, () => this.shutdown());
        this.delay(3000, () => console.log("After 3 seconds (won't trigger)"));
    }

    shutdown() {
        super.shutdown()
        console.log('overworld loop stopped');
    }
}

module.exports = OverworldLoop;
