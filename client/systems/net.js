const sp = require('schemapack');
const netMessages = require('../../shared/net-messages');

const net = {};
net.onConnect = Symbol("net.onConnect");
net.onDisconnect = Symbol("net.onDisconnect");
net.onError = Symbol("net.onError");
const messageQueue = [];
const scenes = new Set();
const loc = window.location;

net.state = {
    connected: false,
    connecting: false,
    queue: []
};
net.send = msg => net.state.queue.push(msg);

function connect() {
    if (net.state.connecting || net.state.connected) {
        return;
    }

    net.state.connecting = true;
    const ws = new WebSocket(`${loc.protocol==='https:'?'wss':'ws'}://${loc.host}`);
    ws.binaryType = 'arraybuffer';

    ws.onopen = (evt) => {
        net.state.connecting = false;
        net.state.connected = true;
        // flush queue
        while (net.state.queue.length) {
            ws.send(net.state.queue.shift());
        }
        messageQueue.push([evt, {sym: net.onConnect}, null]);
    };

    ws.onclose = (evt) => {
        net.state.connecting = false;
        if (net.state.connected) {
            net.state.connected = false;
            messageQueue.push([evt, {sym: net.onDisconnect}, null]);
        }
        setTimeout(connect, 1000);
    };

    ws.onerror = (evt) => {
        messageQueue.push([evt, {sym: net.onError}, null]);
    };

    net.send = (id, data) => {
        const msg = netMessages.encode({id, data});
        if (net.state.connected) {
            // send immediately
            ws.send(msg);
        } else {
            // add to queue
            net.state.queue.push(msg);
        }
    };

    net.disconnect = () => {
        ws.close();
    };

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
}

net.connect = connect;
net.disconnect = ()=>{};

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

    scene.events.on('update', net.onUpdate, scene);
    scene.events.on('destroy', net.unhook, scene);
    scene.events.on('shutdown', net.unhook, scene);
    scenes.add(scene);

    net.connect();
};

net.unhook = function(){
    if (!scenes.has(this)) {
        return;
    }

    this.events.off('update', net.onUpdate, this);
    this.events.off('destroy', net.unhook, this);
    this.events.off('shutdown', net.unhook, this);
    scenes.delete(this);
};

for (const msg of netMessages.client) {
    // create senders
    if (net[msg.key]) throw Error(`Client packet key [${msg.key}] conflicts with existing net property`);
    net[msg.key] = payload => net.send(msg.id, msg.schema.encode(payload));
}

for (const msg of netMessages.server) {
    // create receivers
    if (net[msg.key]) throw Error(`Server packet key [${msg.key}] conflicts with existing net property`);
    net[msg.key] = msg.sym;
}

module.exports = net;
