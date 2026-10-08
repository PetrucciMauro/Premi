/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/server.js
 *
 */
import config from './config.js';
import { connect } from './db.js';
import { createApp } from './app.js';

await connect(config.database);

createApp().listen(config.port, () => {
	console.log('Server listening at http://localhost:' + config.port);
});
