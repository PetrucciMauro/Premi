/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/app.js
 *
 */
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import morgan from 'morgan';
import config from './config.js';
import auth from './auth.js';
import account from './routes/account.js';
import presentations from './routes/presentations.js';
import { privateFiles, publicFiles } from './routes/files.js';

export function createApp({ logging = true } = {}) {
	const app = express();

	if (logging)
		app.use(morgan('dev'));
	// le immagini sono salvate in base64 dentro la presentazione
	app.use(express.json({ limit: config.jsonLimit }));

	app.use('/account', account);
	app.use('/files', publicFiles);

	app.use('/private/api', auth);
	app.use('/private/api/files', privateFiles);
	app.use('/private/api/presentations', presentations);

	// client Angular: file statici e fallback su index.html per il routing lato client
	if (fs.existsSync(config.clientDir)) {
		app.use(express.static(config.clientDir));
		app.get('/{*path}', (req, res, next) => {
			if (/^\/(private\/api|account|files)(\/|$)/.test(req.path))
				return next();
			res.sendFile(path.join(config.clientDir, 'index.html'));
		});
	}

	app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));

	app.use((err, req, res, next) => {
		// presentazione troppo grande per un documento MongoDB (16 MB), di solito per le immagini in base64
		if (err.code === 10334 || err.codeName === 'BSONObjectTooLarge' || /larger than the maximum size/i.test(err.message ?? ''))
			return res.status(413).json({ success: false, message: 'La presentazione supera la dimensione massima consentita (16 MB): usare immagini più leggere' });
		if (err.type === 'entity.too.large')
			return res.status(413).json({ success: false, message: 'Richiesta troppo grande: usare immagini più leggere' });
		console.error(err);
		res.status(err.status || 500).json({ success: false, message: err.message });
	});

	return app;
}
