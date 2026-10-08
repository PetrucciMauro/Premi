/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/auth.js
 *
 * Middleware che verifica il token JWT e ricava l'utente della richiesta.
 */
import jwt from 'jsonwebtoken';
import config from './config.js';

export default function auth(req, res, next) {
	const token = req.get('authorization');
	if (!token)
		return res.status(403).json({ success: false, message: 'No token provided.' });

	try {
		req.user = jwt.verify(token, config.secret).user;
		next();
	} catch {
		res.status(401).json({ success: false, message: 'Failed to authenticate token' });
	}
}
