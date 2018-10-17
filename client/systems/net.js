const socketio = require('socket.io-client/dist/socket.io.js');

const net = {};
const messageQueue = [];
const scenes = new Set();

const io = socketio({transports: ['websocket']});

const idxToSymbol = new Map();
const netMessages = require('../../shared/net-messages');
for (let i = 0; i < netMessages.c.length; i++) {
    let msg = netMessages.c[i];
    const sym = Symbol(msg);
    net[msg] = function(...args){
        // send idx message
        io.emit('x', i, ...args);
    };
}
for (let i = 0; i < netMessages.s.length; i++) {
    let msg = netMessages.s[i];
    const sym = Symbol(msg);
    net[msg] = sym;
    idxToSymbol.set(i, sym);
}

io.on('x', (idx, ...args) => {
    let sym = idxToSymbol.get(idx);
    if (!sym) {
        console.error(`net error: Unknown symbol for packet idx =`, idx);
    }
    messageQueue.push([args, sym, Date.now()]);
});

net.onUpdate = function(clock, delta){
    const cutoff = Date.now() - 1000;
    let discarded = 0;

    while (messageQueue.length > 0) {
        let msg = messageQueue.shift();
        let received = msg.pop();
        let method = msg.pop();

        if (received < cutoff) {
            // drop packets >1 second old
            discarded++;
            continue;
        }

        for (let scene of scenes) {
            if (scene[method]) {
                scene[method](...msg);
                break;
            }
        }
    }

    if (discarded > 0) {
        console.error(`net error: Discarded ${discarded} old packet(s)`);
    }
};

net.hook = function(scene){
    if (scenes.has(scene)) {
        return;
    }

    // console.log('hooking scene', scene.constructor.name);

    scene.events.on('update', net.onUpdate, scene);
    scene.events.on('destroy', net.unhook, scene);
    scene.events.on('shutdown', net.unhook, scene);
    scenes.add(scene);
};

net.unhook = function(){
    if (!scenes.has(this)) {
        return;
    }

    // console.log('unhooking scene', this.constructor.name);

    this.events.off('update', net.onUpdate, this);
    this.events.off('destroy', net.unhook, this);
    this.events.off('shutdown', net.unhook, this);
    scenes.delete(this);
};

module.exports = net;
