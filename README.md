# Phaser IO (Network Game) Boilerplate

## Installation & Running

Clone the repo.

Run `npm i` to install all dependencies

Set `NODE_ENV` to either:
* `production` to have the server build a minified client once during startup.
* `development` to re-build client with every request (includes `.map` files for easier debugging).

Set `PORT` to specify webserver listen port. (default 3064)

Then finally, either:
* Run `npm run start` to start server
* Run `npm run build` to perform a one-off build process without starting up a server.

## Where to begin coding?

### Client-side (Phaser)

All of the client/in-browser code is found within `/client`. The client code is automatically built & bundled into `/client/main.js` when the server is running.

The client entry point (where the `Phaser.Game` is created) can be found in `/client/index.js`.

You can find an initial set of Phaser scenes in `/client/scenes`. This project comes ready with a Bootstrap and Loading scene.

* The **BootstrapScene** is currently used to load just an initial asset and animation for the Loading scene.
* The **LoadingScene** is where the bulk of the asset loading should be performed.

The template scene in `/client/scenes/template.js` gives an example of how to implement netcode on the client side.

### Shared (netcode & game logic)

Network message definitions can be found in `/shared/net-messages.js`, and are defined using [schemapack](https://www.npmjs.com/package/schemapack)'s packet schema definitions.

Use the `/shared` path to store game logic/modules which can be used by both client and server.

### Server-side

A nice starting point is the **Core** class in `/game/core.js`. This class is instantiated when the app is launched, and is where you should bootstrap your game logic. You'll see `async` methods for `startup()` and `shutdown()` which should be overridden.

An example of a game loop can be found in `/game/overworld-loop.js`. One of these is instantiated by the **Core** in this boilerplate. It will keep track of the time in your game, providing an `update()` method (similar to the Phaser.Scene update) to be overridden to run game systems updates at a framerate interval which you specify. This class can also create timers in a way that is tied to the game loop (unlike `setTimeout()` which is not).

A `client.connect` event is fired by the **Core** when a websocket connection is established. The **Client** object has a unique `id`, and a method-wrapper for the `net` messages of the server defined in `/shared/net-messages.js`. The **Client** also emits client messages as events.

## Missing features

* Network & CPU scaling/load balancing.  
  Ideally you'd want to split your game into "room"-like smaller instances and balance the load across multiple processes or servers.
* A lobby system.  
  Most multiplayer games need some kind of lobby system, don't they?
* GUI boilerplate.  
  User interfaces can be tricky in Phaser, and many standard features are missing (text inputs, drop-downs, scroll bars, etc...). Some games can get away with using HTML for this.
* (visual) scaling/fullscreen support.  
  Still waiting to see where Phaser goes on this one. Let's hope for a ScaleManager update in 3.16.0
