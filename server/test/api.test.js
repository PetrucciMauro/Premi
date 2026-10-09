import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { startServer } from '../src/local.js';
import { MediaStore } from '../src/media.js';
import { Store } from '../src/store.js';

const TOKEN = 'token-di-prova';

let dir;
let store;
let media;
let app;

const auth = (req) => req.set('Authorization', TOKEN);
const api = '/private/api/presentations';

before(async () => {
	dir = await fs.mkdtemp(path.join(os.tmpdir(), 'premi-test-'));
	const clientDir = path.join(dir, 'client');
	await fs.mkdir(clientDir);
	await fs.writeFile(path.join(clientDir, 'index.html'), '<app-root></app-root>');

	store = new Store(path.join(dir, 'premi.db'));
	media = await new MediaStore(path.join(dir, 'media')).init();
	app = createApp({ store, media, token: TOKEN, clientDir, logging: false });
});

after(async () => {
	store.close();
	await fs.rm(dir, { recursive: true, force: true });
});

describe('accesso', () => {
	test('API e media richiedono il token di sessione', async () => {
		await request(app).get(api).expect(401);
		await request(app).get(api).set('Authorization', 'sbagliato').expect(401);
		await request(app).get('/media/00000000000000000000000000000000.png').expect(401);
		await auth(request(app).get(api)).expect(200);
	});
});

describe('presentazioni', () => {
	test('ciclo di vita di una presentazione', async () => {
		await auth(request(app).post(`${api}/new/Prima prova`)).expect(200);
		await auth(request(app).post(`${api}/new/Prima prova`)).expect(409);

		const list = await auth(request(app).get(api)).expect(200);
		assert.deepEqual(list.body.message, [{ titolo: 'Prima prova', background: { id: 0 } }]);

		const frame = { id: 1, type: 'frame', xIndex: 10, yIndex: 20, width: 100, height: 100, rotation: 0, zIndex: 0, bookmark: 0, ref: '', color: '' };
		const text = { id: 2, type: 'text', xIndex: 0, yIndex: 0, width: 50, height: 50, rotation: 0, zIndex: 1, content: 'ciao', font: 'Arial', fontSize: 1, color: 'black' };
		await auth(request(app).post(`${api}/Prima prova/element`)).send({ element: frame }).expect(200);
		await auth(request(app).post(`${api}/Prima prova/element`)).send({ element: text }).expect(200);
		await auth(request(app).post(`${api}/Prima prova/element`)).send({ element: text }).expect(409);
		await auth(request(app).put(`${api}/Prima prova/element`)).send({ element: { ...text, content: 'modificato' } }).expect(200);
		await auth(request(app).put(`${api}/Prima prova/element`)).send({ element: { ...text, id: 99 } }).expect(404);
		await auth(request(app).put(`${api}/Prima prova/element`))
			.send({ element: { id: 0, type: 'background', color: 'red', image: '', width: 1600, height: 774 } }).expect(200);
		await auth(request(app).put(`${api}/Prima prova/paths`)).send({ element: { main: [1], choices: [] } }).expect(200);

		let doc = (await auth(request(app).get(`${api}/Prima prova`)).expect(200)).body.message;
		assert.equal(doc.meta.titolo, 'Prima prova');
		assert.equal(doc.proper.texts[0].content, 'modificato');
		assert.equal(doc.proper.frames.length, 1);
		assert.deepEqual(doc.proper.images, []);
		assert.equal(doc.proper.background.color, 'red');
		assert.deepEqual(doc.proper.paths.main, [1]);

		await auth(request(app).delete(`${api}/Prima prova/delete/text/2`)).expect(200);
		doc = (await auth(request(app).get(`${api}/Prima prova`))).body.message;
		assert.equal(doc.proper.texts.length, 0);

		await auth(request(app).post(`${api}/new/Copia/Prima prova`)).expect(200);
		await auth(request(app).post(`${api}/new/Altra/Inesistente`)).expect(404);
		await auth(request(app).post(`${api}/Prima prova/rename/Copia`)).expect(409);
		await auth(request(app).post(`${api}/Prima prova/rename/Rinominata`)).expect(200);
		await auth(request(app).get(`${api}/Prima prova`)).expect(404);
		doc = (await auth(request(app).get(`${api}/Copia`))).body.message;
		assert.equal(doc.proper.frames.length, 1);

		await auth(request(app).delete(`${api}/Copia`)).expect(200);
		await auth(request(app).delete(`${api}/Rinominata`)).expect(200);
		assert.deepEqual((await auth(request(app).get(api))).body.message, []);
	});

	test('gli id stringa salvati dalla vecchia versione vengono gestiti', async () => {
		await auth(request(app).post(`${api}/new/Vecchia`)).expect(200);
		const frame = { id: '3', type: 'frame', xIndex: 0, yIndex: 0, width: 10, height: 10 };
		await auth(request(app).post(`${api}/Vecchia/element`)).send({ element: frame }).expect(200);
		await auth(request(app).put(`${api}/Vecchia/element`)).send({ element: { ...frame, id: 3, xIndex: 5 } }).expect(200);
		let doc = (await auth(request(app).get(`${api}/Vecchia`))).body.message;
		assert.equal(doc.proper.frames[0].xIndex, 5);
		assert.equal(doc.proper.frames[0].id, 3);
		await auth(request(app).delete(`${api}/Vecchia/delete/frame/3`)).expect(200);
		doc = (await auth(request(app).get(`${api}/Vecchia`))).body.message;
		assert.equal(doc.proper.frames.length, 0);
		await auth(request(app).delete(`${api}/Vecchia`)).expect(200);
	});

	test('importazione: i media in base64 diventano file, senza limiti di dimensione del documento', async () => {
		// 20 MB di immagine: oltre il vecchio limite di MongoDB
		const bytes = Buffer.alloc(20 * 1024 * 1024, 7);
		const url = 'data:image/png;base64,' + bytes.toString('base64');
		const image = { id: 1, type: 'image', xIndex: 0, yIndex: 0, width: 10, height: 10, rotation: 0, zIndex: 0, url };
		const copy = { ...image, id: 2 };
		const presentation = { meta: { titolo: 'Importata' }, proper: { paths: { main: [], choices: [] }, images: [image, copy], background: { id: 0, image: url } } };

		await auth(request(app).post(`${api}/import`)).send({ presentation }).expect(200);
		await auth(request(app).post(`${api}/import`)).send({ presentation }).expect(409);
		await auth(request(app).post(`${api}/import`)).send({ presentation: { meta: { titolo: 'a/b' }, proper: {} } }).expect(400);
		await auth(request(app).post(`${api}/import`)).send({ presentation: { proper: {} } }).expect(400);

		const doc = (await auth(request(app).get(`${api}/Importata`))).body.message;
		const stored = doc.proper.images[0].url;
		assert.match(stored, /^media\/[0-9a-f]{32}\.png$/);
		// lo stesso contenuto è salvato una volta sola
		assert.equal(doc.proper.images[1].url, stored);
		assert.equal(doc.proper.background.image, stored);
		assert.deepEqual(await fs.readdir(media.dir).then((names) => names.filter((n) => !n.startsWith('.'))), [stored.slice(6)]);

		const file = await auth(request(app).get('/' + stored)).buffer(true).parse((res, done) => {
			const chunks = [];
			res.on('data', (c) => chunks.push(c)).on('end', () => done(null, Buffer.concat(chunks)));
		}).expect(200);
		assert.equal(file.body.length, bytes.length);
		assert.match(file.get('cache-control'), /immutable/);

		await auth(request(app).delete(`${api}/Importata`)).expect(200);
	});

	test('un elemento salvato con un media in base64 viene convertito in file', async () => {
		await auth(request(app).post(`${api}/new/Base64`)).expect(200);
		const element = { id: 1, type: 'image', xIndex: 0, yIndex: 0, width: 10, height: 10, url: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' };
		await auth(request(app).post(`${api}/Base64/element`)).send({ element }).expect(200);
		const doc = (await auth(request(app).get(`${api}/Base64`))).body.message;
		assert.match(doc.proper.images[0].url, /^media\/[0-9a-f]{32}\.gif$/);
		await auth(request(app).delete(`${api}/Base64`)).expect(200);
	});
});

describe('media', () => {
	test('caricamento: il file prende il nome dal contenuto', async () => {
		const res = await auth(request(app).post('/private/api/media')).attach('file', Buffer.from('<svg/>'), {
			filename: 'disegno.svg',
			contentType: 'image/svg+xml',
		}).expect(200);
		assert.equal(res.body.type, 'image');
		assert.match(res.body.url, /^media\/[0-9a-f]{32}\.svg$/);
		const again = await auth(request(app).post('/private/api/media')).attach('file', Buffer.from('<svg/>'), {
			filename: 'altro-nome.svg',
			contentType: 'image/svg+xml',
		});
		assert.equal(again.body.url, res.body.url);

		await auth(request(app).post('/private/api/media'))
			.attach('file', Buffer.from('%PDF'), { filename: 'documento.pdf', contentType: 'application/pdf' }).expect(415);
		await auth(request(app).post('/private/api/media')).expect(400);
		await auth(request(app).get('/media/..%2Fpremi.db')).expect(404);
	});

	test('all\'avvio vengono eliminati i media non più usati', async () => {
		const dataDir = path.join(dir, 'avvio');
		let server = await startServer({ dataDir, token: TOKEN });
		const used = await new MediaStore(path.join(dataDir, 'media')).save(Buffer.from('usato'), 'image/png');
		const unused = await new MediaStore(path.join(dataDir, 'media')).save(Buffer.from('orfano'), 'image/png');
		server.store.create('Con immagine', { images: [{ id: 1, type: 'image', url: used }] });
		await server.close();

		server = await startServer({ dataDir, token: TOKEN });
		const names = await fs.readdir(path.join(dataDir, 'media'));
		assert.ok(names.includes(used.slice(6)));
		assert.ok(!names.includes(unused.slice(6)));
		const res = await fetch(`${server.url}${api}`, { headers: { Authorization: TOKEN } });
		assert.deepEqual((await res.json()).message.map((p) => p.titolo), ['Con immagine']);
		await server.close();
	});
});

describe('client', () => {
	test('le rotte del client servono index.html, le API sconosciute rispondono 404', async () => {
		const page = await request(app).get('/private/edit/Prova').expect(200);
		assert.match(page.text, /app-root/);
		await auth(request(app).get('/private/api/sconosciuta/x/y')).expect(404);
	});
});
