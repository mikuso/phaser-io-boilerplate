const EventEmitter = require('eventemitter3');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const compression = require('compression');
const chalk = require('chalk');

class WebServer extends EventEmitter {
	constructor() {
		super();

		this.connections = new Set(); // raw TCP connections (not websocket connections)

		this.app = express();
		this.app.set('trust proxy');
		this.server = http.Server(this.app);
		this.io = socketio(this.server);

		this.app.use(compression()); // gzip support

		this.server.on('request', req => {
			this.emit('request', req);
            // this._log(`Request`, req.headers['x-forwarded-for'] || req.socket.remoteAddress);
		});

		this.io.on('connection', sock => {
			this.emit('websocket', sock);
            // this._log(`Websocket`, sock.handshake.headers['x-forwarded-for'] || sock.conn.remoteAddress);
		});

		this.server.on('connection', socket => {
			this.connections.add(socket);
			socket.once('close', () => this.connections.delete(socket));
		});
	}

	async startup(options) {
		await this._listen(options.listenPort);
	}

	async shutdown() {
		this._log(`Waiting for ${this.connections.size} connection(s) to close`);

		// stop accepting new connections now
		this.server.close();
		this._log(`Stopped listening for new connections`);

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
