/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/routes/presentations.js
 *
 * Gestione delle presentazioni dell'utente autenticato: /private/api/presentations
 */
import { Router } from 'express';
import { presentations } from '../db.js';

// tipo di elemento -> campo della presentazione che lo contiene
const FIELDS = {
	text: 'proper.texts',
	frame: 'proper.frames',
	image: 'proper.images',
	SVG: 'proper.SVGs',
	audio: 'proper.audios',
	video: 'proper.videos',
	background: 'proper.background'
};

const emptyPresentation = (titolo) => ({
	meta: { titolo },
	proper: {
		paths: { main: [], choices: [] },
		texts: [], frames: [], images: [], SVGs: [], audios: [], videos: [],
		background: { id: 0 }
	}
});

// le presentazioni salvate dalla vecchia versione hanno id sia numerici sia stringa
const sameId = (id) => ({ $in: [id, String(id), Number(id)].filter((v) => v === v) });

const unknownType = (res, type) =>
	res.status(404).json({ success: false, message: 'element type: ' + type + ' not known' });

const router = Router();

router.get('/', async (req, res) => {
	const docs = await presentations(req.user).find({}, { projection: { meta: 1 } }).toArray();
	res.json({ success: true, message: docs.map((doc) => doc.meta) });
});

router.post('/new/:name', async (req, res) => {
	const collection = presentations(req.user);

	if (await collection.findOne({ 'meta.titolo': req.params.name }) !== null)
		return res.status(409).json({ success: false, message: 'presentation already exists' });

	await collection.insertOne(emptyPresentation(req.params.name));
	res.json({ success: true, message: 'inserted presentation' });
});

router.post('/new/:name/:copyOf', async (req, res) => {
	const collection = presentations(req.user);

	if (await collection.findOne({ 'meta.titolo': req.params.name }) !== null)
		return res.status(409).json({ success: false, message: 'presentation already exists' });

	const original = await collection.findOne({ 'meta.titolo': req.params.copyOf }, { projection: { _id: 0 } });
	if (original === null)
		return res.status(404).json({ success: false, message: 'presentation not found' });

	original.meta.titolo = req.params.name;
	await collection.insertOne(original);
	res.json({ success: true, message: 'inserted presentation' });
});

router.get('/:name', async (req, res) => {
	const doc = await presentations(req.user).findOne({ 'meta.titolo': req.params.name });

	if (doc === null)
		return res.status(404).json({ success: false, message: 'presentation not found' });

	res.json({ success: true, message: doc });
});

router.delete('/:name', async (req, res) => {
	await presentations(req.user).deleteOne({ 'meta.titolo': req.params.name });
	res.json({ success: true, message: 'removed presentation: ' + req.params.name });
});

router.post('/:name/rename/:newName', async (req, res) => {
	const collection = presentations(req.user);

	if (await collection.findOne({ 'meta.titolo': req.params.newName }) !== null)
		return res.status(409).json({ success: false, message: 'presentation already exists' });

	await collection.updateOne({ 'meta.titolo': req.params.name }, { $set: { 'meta.titolo': req.params.newName } });
	res.json({ success: true, message: 'renamed presentation: ' + req.params.newName });
});

router.delete('/:name/delete/:type/:id', async (req, res) => {
	const field = FIELDS[req.params.type];
	if (!field || req.params.type === 'background')
		return unknownType(res, req.params.type);

	await presentations(req.user).updateOne(
		{ 'meta.titolo': req.params.name },
		{ $pull: { [field]: { id: sameId(req.params.id) } } });
	res.json({ success: true, message: 'deleted element' });
});

// sostituisce un elemento esistente (o lo sfondo)
router.put('/:name/element', async (req, res) => {
	const element = req.body?.element;
	if (!element)
		return res.status(400).json({ success: false, message: 'body.element not sent' });

	const field = FIELDS[element.type];
	if (!field)
		return unknownType(res, element.type);

	const collection = presentations(req.user);
	if (element.type === 'background')
		await collection.updateOne({ 'meta.titolo': req.params.name }, { $set: { [field]: element } });
	else
		await collection.updateOne(
			{ 'meta.titolo': req.params.name, [field + '.id']: sameId(element.id) },
			{ $set: { [field + '.$']: element } });

	res.json({ success: true, message: 'element replaced' });
});

// aggiunge un nuovo elemento
router.post('/:name/element', async (req, res) => {
	const element = req.body?.element;
	if (!element)
		return res.status(400).json({ success: false, message: 'body.element not sent' });

	const field = FIELDS[element.type];
	if (!field || element.type === 'background')
		return unknownType(res, element.type);

	await presentations(req.user).updateOne({ 'meta.titolo': req.params.name }, { $push: { [field]: element } });
	res.json({ success: true });
});

router.put('/:name/paths', async (req, res) => {
	const paths = req.body?.element;
	if (!paths)
		return res.status(400).json({ success: false, message: 'body.element not sent' });

	await presentations(req.user).updateOne({ 'meta.titolo': req.params.name }, { $set: { 'proper.paths': paths } });
	res.json({ success: true });
});

export default router;
