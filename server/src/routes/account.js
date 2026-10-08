/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/routes/account.js
 *
 * Autenticazione, registrazione e cambio password.
 * Le credenziali viaggiano nell'header Authorization nel formato "utente:password[:nuovapassword]"
 * (la password arriva già cifrata con SHA-1 dal client).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { users } from '../db.js';
import { MEDIA_TYPES } from './files.js';

const USERNAME = /^[A-Za-z0-9_.-]{1,64}$/;

const credentials = (req) => {
	const [user = '', pass = '', newPass = ''] = (req.get('authorization') || '').split(':');
	return { user, pass, newPass };
};

const router = Router();

router.get('/', (req, res) => {
	res.send('to register: ~/register, to authenticate: ~/authenticate, to change password: ~/changepassword');
});

router.get('/authenticate', async (req, res) => {
	const { user, pass } = credentials(req);
	const doc = await users().findOne({ username: user, password: pass });

	if (doc === null)
		return res.status(401).json({ success: false, message: 'no user found or password not corrected' });

	const token = jwt.sign({ user }, config.secret, { expiresIn: config.tokenExpiresIn });
	res.set('Authorization', token).json({ success: true, message: 'ok' });
});

router.post('/register', async (req, res) => {
	const { user, pass } = credentials(req);

	if (!USERNAME.test(user) || !pass)
		return res.status(400).json({ success: false, message: 'Username non valido: usare solo lettere, numeri, punto, trattino e underscore' });

	if (await users().findOne({ username: user }) !== null)
		return res.status(409).json({ success: false, message: 'Username already registered' });

	await users().insertOne({ username: user, password: pass });
	await Promise.all(MEDIA_TYPES.map((type) =>
		fs.mkdir(path.join(config.filesDir, user, type), { recursive: true })));

	res.json({ success: true, message: 'User ' + user + ' registered' });
});

router.post('/changepassword', async (req, res) => {
	const { user, pass, newPass } = credentials(req);

	if (!newPass)
		return res.status(400).json({ success: false, message: 'New password not provided' });

	const result = await users().updateOne({ username: user, password: pass }, { $set: { password: newPass } });

	if (result.matchedCount === 0)
		return res.status(401).json({ success: false, message: 'Username or password not correct' });

	res.json({ success: true, message: 'Password updated' });
});

export default router;
