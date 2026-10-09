/*
 * File multimediali (immagini, audio, video) salvati su disco, fuori dal database.
 * Ogni file prende il nome dall'impronta SHA-256 del contenuto: lo stesso file caricato
 * più volte occupa spazio una volta sola. Nelle presentazioni compare come "media/<nome>".
 */
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

export const MEDIA_PREFIX = 'media/';

const EXTENSIONS = {
	'image/png': '.png',
	'image/jpeg': '.jpg',
	'image/gif': '.gif',
	'image/webp': '.webp',
	'image/avif': '.avif',
	'image/svg+xml': '.svg',
	'image/bmp': '.bmp',
	'image/x-icon': '.ico',
	'audio/mpeg': '.mp3',
	'audio/mp4': '.m4a',
	'audio/aac': '.aac',
	'audio/ogg': '.ogg',
	'audio/wav': '.wav',
	'audio/x-wav': '.wav',
	'audio/webm': '.webm',
	'audio/flac': '.flac',
	'video/mp4': '.mp4',
	'video/webm': '.webm',
	'video/ogg': '.ogv',
	'video/quicktime': '.mov'
};

export const mediaType = (mime) => /^(image|audio|video)\//.exec(String(mime))?.[1];

/** Estensione del file: dal tipo MIME o, in mancanza, dal nome originale. */
function extension(mime, name = '') {
	const base = String(mime).split(';')[0].trim().toLowerCase();
	if (EXTENSIONS[base])
		return EXTENSIONS[base];
	const ext = path.extname(name).toLowerCase();
	return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : '.bin';
}

const DATA_URL = /^data:([^;,]*)((?:;[^;,]*)*?)(;base64)?,(.*)$/s;

export class MediaStore {
	constructor(dir) {
		this.dir = dir;
		this.tmp = path.join(dir, '.tmp');
	}

	async init() {
		await fs.mkdir(this.tmp, { recursive: true });
		return this;
	}

	/** Percorso su disco di un indirizzo "media/<nome>", undefined se non è un media valido. */
	file(url) {
		if (typeof url !== 'string' || !url.startsWith(MEDIA_PREFIX))
			return undefined;
		const name = url.slice(MEDIA_PREFIX.length);
		return /^[0-9a-f]{32}\.[a-z0-9]{1,8}$/.test(name) ? path.join(this.dir, name) : undefined;
	}

	/** Sposta nell'archivio un file temporaneo e ne restituisce l'indirizzo. */
	async adopt(tempFile, mime, name) {
		const hash = createHash('sha256');
		await pipeline(createReadStream(tempFile), hash);
		const fileName = hash.digest('hex').slice(0, 32) + extension(mime, name);
		const target = path.join(this.dir, fileName);
		try {
			await fs.access(target);
			await fs.rm(tempFile, { force: true });
		} catch {
			await fs.rename(tempFile, target);
		}
		return MEDIA_PREFIX + fileName;
	}

	/** Salva un contenuto in memoria e ne restituisce l'indirizzo. */
	async save(buffer, mime, name) {
		const fileName = createHash('sha256').update(buffer).digest('hex').slice(0, 32) + extension(mime, name);
		const target = path.join(this.dir, fileName);
		try {
			await fs.access(target);
		} catch {
			const temp = path.join(this.tmp, randomUUID());
			await fs.writeFile(temp, buffer);
			await fs.rename(temp, target);
		}
		return MEDIA_PREFIX + fileName;
	}

	/** Un data URL diventa un file dell'archivio; gli altri indirizzi restano come sono. */
	async fromDataUrl(value) {
		if (typeof value !== 'string' || !value.startsWith('data:'))
			return value;
		const match = DATA_URL.exec(value);
		if (!match || !mediaType(match[1]))
			return value;
		const [, mime, , base64, payload] = match;
		const buffer = base64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload), 'utf8');
		return this.save(buffer, mime);
	}

	/**
	 * Estrae i media incorporati in base64 (sfondo, sfondi dei frame, immagini, audio e
	 * video) e li sostituisce con il loro indirizzo nell'archivio. Modifica `proper`.
	 */
	async externalize(proper) {
		if (!proper || typeof proper !== 'object')
			return proper;
		if (proper.background && typeof proper.background === 'object')
			proper.background.image = await this.fromDataUrl(proper.background.image);
		for (const frame of Array.isArray(proper.frames) ? proper.frames : [])
			if (frame) frame.ref = await this.fromDataUrl(frame.ref);
		for (const collection of ['images', 'audios', 'videos'])
			for (const el of Array.isArray(proper[collection]) ? proper[collection] : [])
				if (el) el.url = await this.fromDataUrl(el.url);
		return proper;
	}

	/** Come externalize, per un singolo elemento o per lo sfondo. */
	async externalizeElement(element) {
		if (!element || typeof element !== 'object')
			return element;
		if (element.type === 'background')
			element.image = await this.fromDataUrl(element.image);
		else if (element.type === 'frame')
			element.ref = await this.fromDataUrl(element.ref);
		else if ('url' in element)
			element.url = await this.fromDataUrl(element.url);
		return element;
	}

	/** Elimina i file non più citati in nessuno dei contenuti dati; restituisce quanti ne ha eliminati. */
	async collectGarbage(contents) {
		const used = new Set();
		const pattern = /media\/([0-9a-f]{32}\.[a-z0-9]{1,8})/g;
		for (const text of contents)
			for (const match of String(text).matchAll(pattern))
				used.add(match[1]);
		let removed = 0;
		for (const name of await fs.readdir(this.dir)) {
			if (name.startsWith('.') || used.has(name))
				continue;
			await fs.rm(path.join(this.dir, name), { force: true });
			removed++;
		}
		await fs.rm(this.tmp, { recursive: true, force: true });
		await fs.mkdir(this.tmp, { recursive: true });
		return removed;
	}
}
