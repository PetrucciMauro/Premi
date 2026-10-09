/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/routes/presentations.js
 *
 * Presentazioni: /private/api/presentations. I dati sono in SQLite (store.js), i media
 * incorporati in base64 vengono salvati come file (media.js) e sostituiti dal loro indirizzo.
 */
import { Router } from 'express';
import { COLLECTIONS } from '../store.js';

const unknownType = (res, type) =>
	res.status(404).json({ success: false, message: 'element type: ' + type + ' not known' });

const notFound = (res) => res.status(404).json({ success: false, message: 'presentation not found' });
const conflict = (res) => res.status(409).json({ success: false, message: 'presentation already exists' });

const validTitle = (title) => typeof title === 'string' && title.trim() !== '' && !title.includes('/');

export default function presentations({ store, media }) {
	const router = Router();

	router.get('/', (req, res) => {
		res.json({ success: true, message: store.list() });
	});

	router.post('/new/:name', (req, res) => {
		if (!validTitle(req.params.name))
			return res.status(400).json({ success: false, message: 'titolo non valido' });
		if (!store.create(req.params.name))
			return conflict(res);
		res.json({ success: true, message: 'inserted presentation' });
	});

	router.post('/new/:name/:copyOf', (req, res) => {
		if (!validTitle(req.params.name))
			return res.status(400).json({ success: false, message: 'titolo non valido' });
		const result = store.copy(req.params.copyOf, req.params.name);
		if (result === 'missing')
			return notFound(res);
		if (result === 'exists')
			return conflict(res);
		res.json({ success: true, message: 'inserted presentation' });
	});

	// importa una presentazione esportata in JSON: body.presentation = { meta, proper }
	router.post('/import', async (req, res) => {
		const presentation = req.body?.presentation;
		const titolo = presentation?.meta?.titolo;
		if (!validTitle(titolo) || typeof presentation.proper !== 'object' || presentation.proper === null || Array.isArray(presentation.proper))
			return res.status(400).json({ success: false, message: 'presentazione non valida' });
		if (store.presentationId(titolo) !== undefined)
			return conflict(res);

		const proper = await media.externalize(presentation.proper);
		if (!store.create(titolo, proper))
			return conflict(res);
		res.json({ success: true, message: 'imported presentation' });
	});

	router.get('/:name', (req, res) => {
		const doc = store.get(req.params.name);
		if (!doc)
			return notFound(res);
		res.json({ success: true, message: doc });
	});

	router.delete('/:name', (req, res) => {
		store.remove(req.params.name);
		res.json({ success: true, message: 'removed presentation: ' + req.params.name });
	});

	router.post('/:name/rename/:newName', (req, res) => {
		if (!validTitle(req.params.newName))
			return res.status(400).json({ success: false, message: 'titolo non valido' });
		const result = store.rename(req.params.name, req.params.newName);
		if (result === 'missing')
			return notFound(res);
		if (result === 'exists')
			return conflict(res);
		res.json({ success: true, message: 'renamed presentation: ' + req.params.newName });
	});

	router.delete('/:name/delete/:type/:id', (req, res) => {
		if (!COLLECTIONS[req.params.type])
			return unknownType(res, req.params.type);
		if (!store.deleteElement(req.params.name, req.params.type, req.params.id))
			return notFound(res);
		res.json({ success: true, message: 'deleted element' });
	});

	// sostituisce un elemento esistente (o lo sfondo)
	router.put('/:name/element', async (req, res) => {
		const element = req.body?.element;
		if (!element)
			return res.status(400).json({ success: false, message: 'body.element not sent' });
		if (element.type !== 'background' && !COLLECTIONS[element.type])
			return unknownType(res, element.type);

		await media.externalizeElement(element);
		const ok = element.type === 'background' ? store.setBackground(req.params.name, element) : store.replaceElement(req.params.name, element);
		if (!ok)
			return res.status(404).json({ success: false, message: 'element not found' });
		res.json({ success: true, message: 'element replaced' });
	});

	// aggiunge un nuovo elemento
	router.post('/:name/element', async (req, res) => {
		const element = req.body?.element;
		if (!element)
			return res.status(400).json({ success: false, message: 'body.element not sent' });
		if (!COLLECTIONS[element.type])
			return unknownType(res, element.type);
		if (!Number.isFinite(Number(element.id)))
			return res.status(400).json({ success: false, message: 'element id not valid' });

		await media.externalizeElement(element);
		if (!store.addElement(req.params.name, element))
			return res.status(409).json({ success: false, message: 'presentation not found or element already exists' });
		res.json({ success: true });
	});

	router.put('/:name/paths', (req, res) => {
		const paths = req.body?.element;
		if (!paths)
			return res.status(400).json({ success: false, message: 'body.element not sent' });
		if (!store.setPaths(req.params.name, paths))
			return notFound(res);
		res.json({ success: true });
	});

	return router;
}
