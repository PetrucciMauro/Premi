/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/app.js
 *
 * Server locale di Premi: API delle presentazioni, file multimediali e client Angular.
 * Gira sul computer dell'utente (dentro l'app Electron), in ascolto solo su 127.0.0.1.
 */
import { timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import morgan from 'morgan';
import mediaRoutes from './routes/media.js';
import presentations from './routes/presentations.js';

/**
 * Con un token, ogni richiesta alle API e ai media deve averlo nell'header Authorization:
 * l'app Electron lo aggiunge da sé, così gli altri programmi del computer non possono usare
 * il server. Senza token (sviluppo) l'accesso è libero.
 */
function requireToken(token) {
	if (!token)
		return (req, res, next) => next();
	const expected = Buffer.from(token);
	return (req, res, next) => {
		const given = Buffer.from(req.get('authorization') ?? '');
		if (given.length === expected.length && timingSafeEqual(given, expected))
			return next();
		res.status(401).json({ success: false, message: 'Accesso non autorizzato' });
	};
}

/**
 * @param {object} options
 * @param {import('./store.js').Store} options.store
 * @param {import('./media.js').MediaStore} options.media
 * @param {string} [options.token] token richiesto alle API (vedi requireToken)
 * @param {string} [options.clientDir] build del client Angular da servire
 * @param {boolean} [options.logging]
 */
export function createApp({ store, media, token, clientDir, logging = true }) {
	const app = express();
	const auth = requireToken(token);

	if (logging)
		app.use(morgan('dev'));

	// le presentazioni importate possono contenere media in base64: vengono subito salvati come file
	app.use('/private/api/presentations/import', express.json({ limit: '2gb' }));
	app.use(express.json({ limit: '64mb' }));

	app.use('/private/api', auth);
	app.use('/private/api/media', mediaRoutes({ media }));
	app.use('/private/api/presentations', presentations({ store, media }));

	// i media non cambiano mai (il nome è l'impronta del contenuto)
	app.use('/media', auth, express.static(media.dir, { immutable: true, maxAge: '1y', index: false, dotfiles: 'ignore' }));

	// client Angular: file statici e fallback su index.html per il routing lato client
	if (clientDir && fs.existsSync(clientDir)) {
		app.use(express.static(clientDir));
		app.get('/{*path}', (req, res, next) => {
			if (/^\/(private\/api|media)(\/|$)/.test(req.path))
				return next();
			res.sendFile(path.join(clientDir, 'index.html'));
		});
	}

	app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));

	app.use((err, req, res, next) => {
		if (err.type === 'entity.too.large')
			return res.status(413).json({ success: false, message: 'Richiesta troppo grande' });
		console.error(err);
		res.status(err.status || 500).json({ success: false, message: err.message });
	});

	return app;
}
