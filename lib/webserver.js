const EventEmitter = require('eventemitter3');
const http = require('http');
const express = require('express');
const ws = require('ws');
const compression = require('compression');
const chalk = require('chalk');

const SOCKET_ALIVE = Symbol("SOCKET_ALIVE");

class WebServer extends EventEmitter {
	constructor() {
		super();

		this.connections = new Set(); // raw TCP connections (not websocket connections)

		this.app = express();
		this.app.set('trust proxy');
		this.server = http.Server(this.app);
		this.ws = new ws.Server({server: this.server});

		this.app.use(compression()); // gzip support

		this.server.on('request', req => {
			this.emit('request', req);
            // this._log(`Request`, req.headers['x-forwarded-for'] || req.socket.remoteAddress);
		});

		this.ws.on('connection', sock => {
            sock[SOCKET_ALIVE] = true;
            sock.on('pong', () => sock[SOCKET_ALIVE] = true);
			this.emit('websocket', sock);
            // this._log(`Websocket`, sock.handshake.headers['x-forwarded-for'] || sock.conn.remoteAddress);
		});

		this.server.on('connection', socket => {
			this.connections.add(socket);
			socket.once('close', () => this.connections.delete(socket));
		});
	}

	async startup(options) {
        if (!this._wsKeepalive) {
            // drop any clients which don't respond to ping() after 30 seconds
            this._wsKeepalive = setInterval(() => {
                for (let sock of this.ws.clients) {
                    if (!sock[SOCKET_ALIVE]) {
                        sock.terminate();
                        console.log('dropped');
                    }

                    sock[SOCKET_ALIVE] = false;
                    sock.ping(err => {});
                }
            }, 30*1000);
        }

		await this._listen(options.listenPort);
	}

	async shutdown() {
        if (this._wsKeepalive) {
            clearInterval(this._wsKeepalive);
        }

		// stop accepting new connections now
		this.server.close();
		this._log(`Stopped listening for new connections`);

        this._log(`Closing ${this.ws.clients.size} websocket connection(s)`);
        for (let sock of this.ws.clients) {
            sock.terminate();
        }

		this._log(`Waiting for ${this.connections.size} HTTP connection(s) to close`);

		let timeout;
		await Promise.race([
			// wait for close to complete
			new Promise(resolve => {
				this.server.once('close', () => {
					this._log(`Server closed`);
					resolve();
				});
			}),
			// ...or timeout
			new Promise(r => timeout = setTimeout(r, 1000*5)) // 5 secs
		]);
		clearTimeout(timeout);

		let connectionCount = await new Promise((resolve, reject) => {
			this.server.getConnections((err, count) => err ? reject(err) : resolve(count));
		});

		if (connectionCount > 0) {
			this._log(`Force-closing remaining ${connectionCount} connection(s)`);
			await this._dropAllConnections();
		}
		this._log('Server shutdown complete');
	}

	// private

	async _listen(port) {
		return new Promise((resolve, reject) => {
			let listener, onListening, onError, removeListeners;

			this.server.once('listening', onListening = () => {
				removeListeners();
				let addr = listener.address();
				this._log(`Listening on port ${addr.address}:${addr.port}`);
				resolve(addr);
			});

			this.server.once('error', onError = err => {
				removeListeners();
				reject(err)
			});

			removeListeners = () => {
				this.server.removeListener('listening', onListening);
				this.server.removeListener('error', onError);
			}

			listener = this.server.listen(port);
		});
	}

	async _dropAllConnections() {
		this.connections.forEach(sock => sock.destroy());
	}

	_log(...args) {
		console.log(chalk.yellow.bold(`[WebServer]`), ...args);
	}
}

module.exports = WebServer;
