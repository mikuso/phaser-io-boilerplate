const sp = require('schemapack');
const netMessages = require('../../shared/net-messages');

const net = {};
net.onDisconnect = Symbol("net.onDisconnect");
const messageQueue = [];
const scenes = new Set();
const loc = window.location;
const ws = new WebSocket(`${loc.protocol==='https:'?'wss':'ws'}://${loc.host}`);

ws.binaryType = 'arraybuffer';

ws.isOpen = new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
});

ws.onclose = (evt) => {
    console.log('websocket closed', evt);
    messageQueue.push([evt, {sym: net.onDisconnect}, null]);
}

ws.onerror = (err) => {
    console.log('websocket error', err);
}

async function send(id, data) {
    await ws.isOpen;
    console.log('sending', id, data);
    ws.send(netMessages.encode({id, data}));
}


for (const msg of netMessages.client) {
    // create senders
    net[msg.key] = payload => send(msg.id, msg.schema.encode(payload));
}

for (const msg of netMessages.server) {
    // create receivers
    net[msg.key] = msg.sym;
}

ws.onmessage = (buffer) => {
    try {
        const {id, data} = netMessages.decode(buffer.data);
        const msgDef = netMessages.server[id];
        if (!msgDef) {
            throw Error(`Unknown message type: ${id}`);
        }
        const msg = msgDef.schema.decode(data);
        messageQueue.push([msg, msgDef, Date.now()]);
    } catch (err) {
        console.error(`net error:`, err);
    }
};




net.onUpdate = function(clock, delta){
    const cutoff = Date.now() - 1000;
    let discarded = 0;

    while (messageQueue.length > 0) {
        const [msg, def, time] = messageQueue.shift();

        if (time && time < cutoff) {
            // drop packets >1 second old
            discarded++;
            continue;
        }

        for (let scene of scenes) {
            if (scene[def.sym]) {
                scene[def.sym](msg);
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
