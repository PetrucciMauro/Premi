/*
 * Avvia il server con un MongoDB in memoria: utile per provare Premi senza installare MongoDB.
 * I dati vengono persi alla chiusura.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri('premi');
console.log('MongoDB in memoria: ' + process.env.MONGODB_URI);

const stop = async () => {
	await mongod.stop();
	process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

await import('../src/server.js');
