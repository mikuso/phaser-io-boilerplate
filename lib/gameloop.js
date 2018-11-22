const EventEmitter = require("eventemitter3");

function timerSort(t1, t2) {
    if (t1.t === t2.t) return t1.id > t2.id ? -1 : 1;
    return t1.t > t2.t ? -1 : 1;
}

class GameLoop extends EventEmitter {
    constructor({framerate = 60} = {}) {
        super();
        this.frameDelta = (1000/framerate) << 0;
        this._timers = [];
    }

    update() {
        /* implemented by subclasses */
    }

    startup() {
        this._lastTimerId = 0;
        this._loopBound = this._loop.bind(this);
        this._startTime = Date.now();
        this._lastFrameTime = this._startTime;
        this._timeAcc = 0;
        this._isShuttingDown = false;
        this._loopTimer = setTimeout(this._loopBound, this.frameDelta);
    }

    shutdown() {
        clearTimeout(this._loopTimer);
        this._isShuttingDown = true;
    }

    getTime() {
        return Date.now() - this._startTime;
    }

    delay(ms, fn) {
        const timer = {fn, id: ++this._lastTimerId, t: this._lastFrameTime + ms};
        this._timers.push(timer);
        this._timers.sort(timerSort);
        return {stop: () => {
            const idx = this._timers.indexOf(timer);
            if (idx === -1) return;
            this._timers.splice(idx, 1);
        }};
    }


    _loop() {
        const now = Date.now();
        this._timeAcc += (now - this._lastFrameTime);
        this._lastFrameTime = now;
        for (let i = this._timers.length - 1; i >= 0; i--) {
            const timer = this._timers[i];
            if (timer.t > now) break;
            this._timers.pop().fn();
        }
        while (this._timeAcc >= this.frameDelta) {
            this._timeAcc -= this.frameDelta;
            this.update();
        }

        if (!this._isShuttingDown) {
            this._loopTimer = setTimeout(this._loopBound, this.frameDelta);
        }
    }
}

module.exports = GameLoop;
