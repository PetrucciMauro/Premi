/*
 * Caricamento dei file multimediali: /private/api/media.
 * Il file arriva come multipart (campo "file"), viene scritto in una cartella temporanea e
 * poi spostato nell'archivio con il nome dato dal suo contenuto (vedi media.js).
 */
import fs from 'node:fs/promises';
import { Router } from 'express';
import multer from 'multer';
import { mediaType } from '../media.js';

export default function mediaRoutes({ media }) {
	const router = Router();
	const upload = multer({ dest: media.tmp });

	router.post('/', upload.single('file'), async (req, res) => {
		if (!req.file)
			return res.status(400).json({ success: false, message: 'file not sent' });
		const type = mediaType(req.file.mimetype);
		if (!type) {
			await fs.rm(req.file.path, { force: true });
			return res.status(415).json({ success: false, message: 'Formato del file non supportato' });
		}
		const url = await media.adopt(req.file.path, req.file.mimetype, req.file.originalname);
		res.json({ success: true, type, url });
	});

	return router;
}
