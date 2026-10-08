/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/db.js
 *
 * Connessione unica a MongoDB condivisa da tutte le richieste.
 */
import { MongoClient } from 'mongodb';

let client;
let db;

export async function connect(uri) {
	client = new MongoClient(uri);
	await client.connect();
	db = client.db();
	return db;
}

export async function disconnect() {
	await client?.close();
	client = undefined;
	db = undefined;
}

export function users() {
	return db.collection('users');
}

// ogni utente ha la propria collezione di presentazioni
export function presentations(user) {
	return db.collection('presentations' + user);
}
