/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/server.js
 *
 */
import config from './config.js';
import { connect } from './db.js';
import { createApp } from './app.js';

try {
	await connect(config.database);
} catch (err) {
	console.error(`Impossibile connettersi a MongoDB (${config.database}): ${err.message}`);
	console.error('Avviare MongoDB, impostare MONGODB_URI oppure usare "npm run start:memory" per un database in memoria.');
	process.exit(1);
}

createApp().listen(config.port, () => {
	console.log('Server listening at http://localhost:' + config.port);
});
