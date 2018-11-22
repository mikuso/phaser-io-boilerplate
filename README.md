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

All of the client/in-browser code is found within `/client`. The client code is automatically built & bundled into `/client/main.js` when the server is running.

The client entry point, where the `Phaser.Game` is created, can be found in `/client/index.js`.

You can find an initial set of Phaser scenes in `/client/scenes`. This project comes ready with a Bootstrap and Loading scene.

* The **BootstrapScene** is currently used to load just an initial asset and animation for the Loading scene.
* The **LoadingScene** is where the bulk of the asset loading should be performed.

The template scene in `/client/scenes/template.js` gives an example of how to implement netcode.

Network message definitions can be found in `/shared/net-messages.js`, and are defined using [schemapack](https://www.npmjs.com/package/schemapack)'s packet schema definitions.

The `startup()` method in `/lib/gameserver.js` is a good starting point to build your server-side logic.

The **GameServer** emits a `player.connected` event when a **Player** connects, and gives you the **Player** instance.

**Player**s emit events as defined in the `/shared/net-messages.js` file.

## Missing features

* Network & CPU scaling/load balancing.  
  Ideally you'd want to split your game into "room"-like smaller instances and balance the load across multiple processes or servers.
* A lobby system.  
  Most multiplayer games need some kind of lobby system, don't they?
* GUI boilerplate.  
  User interfaces can be tricky in Phaser, and many standard features are missing (text inputs, drop-downs, scroll bars, etc...).
* (visual) scaling/fullscreen support.  
  Waiting to see where Phaser goes on this one. Let's hope for a ScaleManager update in 3.16.0
