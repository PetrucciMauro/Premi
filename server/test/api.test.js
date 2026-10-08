import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

let mongod;
let app;
let disconnect;
let filesDir;
let token;

const auth = (req) => req.set('Authorization', token);

before(async () => {
	mongod = await MongoMemoryServer.create();
	filesDir = await fs.mkdtemp(path.join(os.tmpdir(), 'premi-files-'));
	process.env.FILES_DIR = filesDir;
	process.env.CLIENT_DIR = path.join(filesDir, 'client');
	await fs.mkdir(process.env.CLIENT_DIR);
	await fs.writeFile(path.join(process.env.CLIENT_DIR, 'index.html'), '<app-root></app-root>');

	const db = await import('../src/db.js');
	const { createApp } = await import('../src/app.js');
	await db.connect(mongod.getUri('premi'));
	disconnect = db.disconnect;
	app = createApp({ logging: false });
});

after(async () => {
	await disconnect();
	await mongod.stop();
	await fs.rm(filesDir, { recursive: true, force: true });
});

describe('account', () => {
	test('registrazione, login e cambio password', async () => {
		await request(app).post('/account/register').set('Authorization', 'mario:hash1').expect(200);
		await request(app).post('/account/register').set('Authorization', 'mario:hash1').expect(409);
		await request(app).post('/account/register').set('Authorization', '../evil:hash1').expect(400);

		await request(app).get('/account/authenticate').set('Authorization', 'mario:wrong').expect(401);
		const res = await request(app).get('/account/authenticate').set('Authorization', 'mario:hash1').expect(200);
		token = res.get('authorization');
		assert.ok(token);

		await request(app).post('/account/changepassword').set('Authorization', 'mario:wrong:hash2').expect(401);
		await request(app).post('/account/changepassword').set('Authorization', 'mario:hash1:hash2').expect(200);
		await request(app).get('/account/authenticate').set('Authorization', 'mario:hash2').expect(200);
		await request(app).post('/account/changepassword').set('Authorization', 'mario:hash2:hash1').expect(200);

		const dirs = await fs.readdir(path.join(filesDir, 'mario'));
		assert.deepEqual(dirs.sort(), ['audio', 'image', 'video']);
	});

	test('le rotte private richiedono un token valido', async () => {
		await request(app).get('/private/api/presentations').expect(403);
		await request(app).get('/private/api/presentations').set('Authorization', 'abc').expect(401);
	});
});

describe('presentations', () => {
	test('ciclo di vita di una presentazione', async () => {
		await auth(request(app).post('/private/api/presentations/new/Prima prova')).expect(200);
		await auth(request(app).post('/private/api/presentations/new/Prima prova')).expect(409);

		const list = await auth(request(app).get('/private/api/presentations')).expect(200);
		assert.deepEqual(list.body.message, [{ titolo: 'Prima prova' }]);

		const frame = { id: 1, type: 'frame', xIndex: 10, yIndex: 20, width: 100, height: 100, rotation: 0, zIndex: 0, bookmark: 0, ref: '', color: '' };
		const text = { id: 2, type: 'text', xIndex: 0, yIndex: 0, width: 50, height: 50, rotation: 0, zIndex: 1, content: 'ciao', font: 'Arial', fontSize: 1, color: 'black' };
		await auth(request(app).post('/private/api/presentations/Prima prova/element')).send({ element: frame }).expect(200);
		await auth(request(app).post('/private/api/presentations/Prima prova/element')).send({ element: text }).expect(200);
		await auth(request(app).put('/private/api/presentations/Prima prova/element')).send({ element: { ...text, content: 'modificato' } }).expect(200);
		await auth(request(app).put('/private/api/presentations/Prima prova/element'))
			.send({ element: { id: 0, type: 'background', color: 'red', image: '', width: 1600, height: 774 } }).expect(200);
		await auth(request(app).put('/private/api/presentations/Prima prova/paths')).send({ element: { main: [1], choices: [] } }).expect(200);

		let doc = (await auth(request(app).get('/private/api/presentations/Prima prova')).expect(200)).body.message;
		assert.equal(doc.proper.texts[0].content, 'modificato');
		assert.equal(doc.proper.frames.length, 1);
		assert.equal(doc.proper.background.color, 'red');
		assert.deepEqual(doc.proper.paths.main, [1]);

		await auth(request(app).delete('/private/api/presentations/Prima prova/delete/text/2')).expect(200);
		doc = (await auth(request(app).get('/private/api/presentations/Prima prova'))).body.message;
		assert.equal(doc.proper.texts.length, 0);

		await auth(request(app).post('/private/api/presentations/new/Copia/Prima prova')).expect(200);
		await auth(request(app).post('/private/api/presentations/Prima prova/rename/Copia')).expect(409);
		await auth(request(app).post('/private/api/presentations/Prima prova/rename/Rinominata')).expect(200);
		await auth(request(app).get('/private/api/presentations/Prima prova')).expect(404);
		doc = (await auth(request(app).get('/private/api/presentations/Copia'))).body.message;
		assert.equal(doc.proper.frames.length, 1);

		await auth(request(app).delete('/private/api/presentations/Copia')).expect(200);
		await auth(request(app).delete('/private/api/presentations/Rinominata')).expect(200);
		const empty = await auth(request(app).get('/private/api/presentations'));
		assert.deepEqual(empty.body.message, []);
	});

	test('gli id stringa salvati dalla vecchia versione vengono gestiti', async () => {
		await auth(request(app).post('/private/api/presentations/new/Vecchia')).expect(200);
		const frame = { id: '3', type: 'frame', xIndex: 0, yIndex: 0, width: 10, height: 10 };
		await auth(request(app).post('/private/api/presentations/Vecchia/element')).send({ element: frame }).expect(200);
		await auth(request(app).put('/private/api/presentations/Vecchia/element')).send({ element: { ...frame, id: 3, xIndex: 5 } }).expect(200);
		let doc = (await auth(request(app).get('/private/api/presentations/Vecchia'))).body.message;
		assert.equal(doc.proper.frames[0].xIndex, 5);
		await auth(request(app).delete('/private/api/presentations/Vecchia/delete/frame/3')).expect(200);
		doc = (await auth(request(app).get('/private/api/presentations/Vecchia'))).body.message;
		assert.equal(doc.proper.frames.length, 0);
	});

	test('importazione di una presentazione in JSON con immagini base64', async () => {
		const url = 'data:image/png;base64,' + Buffer.alloc(2 * 1024 * 1024).toString('base64');
		const image = { id: 1, type: 'image', xIndex: 0, yIndex: 0, width: 10, height: 10, rotation: 0, zIndex: 0, url };
		const presentation = { meta: { titolo: 'Importata' }, proper: { paths: { main: [], choices: [] }, images: [image] } };

		await auth(request(app).post('/private/api/presentations/import')).send({ presentation }).expect(200);
		await auth(request(app).post('/private/api/presentations/import')).send({ presentation }).expect(409);
		await auth(request(app).post('/private/api/presentations/import'))
			.send({ presentation: { meta: { titolo: 'a/b' }, proper: {} } }).expect(400);
		await auth(request(app).post('/private/api/presentations/import')).send({ presentation: { proper: {} } }).expect(400);

		const doc = (await auth(request(app).get('/private/api/presentations/Importata'))).body.message;
		assert.equal(doc.proper.images[0].url, url);
		assert.deepEqual(doc.proper.texts, []);
		await auth(request(app).delete('/private/api/presentations/Importata')).expect(200);
	});
});

describe('client', () => {
	test('le rotte del client servono index.html, le API sconosciute rispondono 404', async () => {
		const page = await request(app).get('/private/edit/Prova').expect(200);
		assert.match(page.text, /app-root/);
		await auth(request(app).get('/private/api/sconosciuta/x/y')).expect(404);
	});
});

describe('files', () => {
	test('upload, elenco, download, rinomina ed eliminazione', async () => {
		await auth(request(app).post('/private/api/files/image/foto'))
			.attach('file', Buffer.from('png-data'), 'originale.png').expect(201);

		const list = await auth(request(app).get('/private/api/files/image')).expect(200);
		assert.deepEqual(list.body.names, ['foto.png']);

		const file = await request(app).get('/files/mario/image/foto.png').expect(200);
		assert.equal(file.body.toString(), 'png-data');
		await request(app).get('/files/mario/image/..%2F..%2Fsecret').expect(404);

		await auth(request(app).post('/private/api/files/image/foto.png/nuova.png')).expect(200);
		await auth(request(app).delete('/private/api/files/image/nuova.png')).expect(200);
		await auth(request(app).delete('/private/api/files/image/nuova.png')).expect(404);
		await auth(request(app).get('/private/api/files/document')).expect(404);
	});
});
