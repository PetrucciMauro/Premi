/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/routes/files.js
 *
 * Gestione dei file multimediali (immagini, audio, video) caricati dagli utenti.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import config from '../config.js';

export const MEDIA_TYPES = ['image', 'audio', 'video'];

// il nome del file arriva dall'URL: si tiene solo il nome, mai un percorso
const safeName = (name) => path.basename(String(name));

const mediaDir = (user, type) => path.join(config.filesDir, user, type);

const checkType = (req, res, next) => {
	if (!MEDIA_TYPES.includes(req.params.type))
		return res.status(404).json({ success: false, message: 'file type: ' + req.params.type + ' not known' });
	next();
};

const exists = (file) => fs.access(file).then(() => true, () => false);

const upload = multer({
	storage: multer.diskStorage({
		destination: async (req, file, cb) => {
			const dir = mediaDir(req.user, req.params.type);
			try {
				await fs.mkdir(dir, { recursive: true });
				cb(null, dir);
			} catch (err) {
				cb(err);
			}
		},
		// il file prende il nome indicato nell'URL, con l'estensione del file originale
		filename: (req, file, cb) => {
			const name = safeName(req.params.name);
			cb(null, path.extname(name) ? name : name + path.extname(file.originalname));
		}
	}),
	limits: { fileSize: 200 * 1024 * 1024 }
});

// rotte protette dal token: /private/api/files
export const privateFiles = Router();

privateFiles.get('/:type', checkType, async (req, res) => {
	const dir = mediaDir(req.user, req.params.type);
	const names = await exists(dir) ? await fs.readdir(dir) : [];
	res.json({ success: true, message: 'correctly get files names', names });
});

privateFiles.post('/:type/:name', checkType, upload.single('file'), (req, res) => {
	if (!req.file)
		return res.status(400).json({ success: false, message: 'file not sent' });
	res.status(201).json({ success: true, name: req.file.filename });
});

privateFiles.delete('/:type/:name', checkType, async (req, res) => {
	const file = path.join(mediaDir(req.user, req.params.type), safeName(req.params.name));

	if (!await exists(file))
		return res.status(404).json({ success: false, message: 'file ' + req.params.name + ' does not exists' });

	await fs.unlink(file);
	res.json({ success: true, message: 'correctly delete file ' + req.params.name });
});

privateFiles.post('/:type/:name/:newName', checkType, async (req, res) => {
	const dir = mediaDir(req.user, req.params.type);
	const from = path.join(dir, safeName(req.params.name));
	const to = path.join(dir, safeName(req.params.newName));

	if (!await exists(from))
		return res.status(404).json({ success: false, message: 'file ' + req.params.name + ' does not exists' });

	await fs.rename(from, to);
	res.json({ success: true, message: 'correctly renamed file ' + req.params.name + ' in ' + req.params.newName });
});

// rotta pubblica: /files/<utente>/<tipo>/<nome>
export const publicFiles = Router();

publicFiles.get('/:user/:type/:name', checkType, (req, res) => {
	res.sendFile(safeName(req.params.name), { root: mediaDir(safeName(req.params.user), req.params.type), dotfiles: 'deny' }, (err) => {
		if (err && !res.headersSent)
			res.status(404).json({ success: false, message: 'File not found' });
	});
});
