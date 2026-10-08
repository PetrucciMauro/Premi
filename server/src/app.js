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
	app.use(express.json({ limit: '1mb' }));

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
		console.error(err);
		res.status(err.status || 500).json({ success: false, message: err.message });
	});

	return app;
}
