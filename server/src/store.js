/*
 * Archivio delle presentazioni in SQLite (modulo node:sqlite, incluso in Node ed Electron:
 * nessun modulo nativo da compilare).
 * Ogni elemento è una riga di `elements`, così le modifiche dell'editor (che salva elemento
 * per elemento) non riscrivono tutta la presentazione. I media non stanno nel database ma
 * in file separati (vedi media.js): qui ci sono solo i loro indirizzi.
 */
import { DatabaseSync } from 'node:sqlite';

// tipo di elemento -> collezione della presentazione che lo contiene
export const COLLECTIONS = {
	text: 'texts',
	frame: 'frames',
	image: 'images',
	SVG: 'SVGs',
	audio: 'audios',
	video: 'videos'
};

const SCHEMA_VERSION = 1;

const emptyPaths = () => ({ main: [], choices: [] });
const emptyBackground = () => ({ id: 0 });

export class Store {
	constructor(file) {
		this.db = new DatabaseSync(file);
		this.db.exec('PRAGMA foreign_keys = ON');
		if (file !== ':memory:')
			this.db.exec('PRAGMA journal_mode = WAL');
		this.migrate();
	}

	close() {
		this.db.close();
	}

	migrate() {
		const { user_version: version } = this.db.prepare('PRAGMA user_version').get();
		if (version >= SCHEMA_VERSION)
			return;
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS presentations (
				id INTEGER PRIMARY KEY,
				title TEXT NOT NULL UNIQUE,
				background TEXT NOT NULL,
				paths TEXT NOT NULL,
				created_at TEXT NOT NULL DEFAULT (datetime('now')),
				updated_at TEXT NOT NULL DEFAULT (datetime('now'))
			);
			CREATE TABLE IF NOT EXISTS elements (
				presentation_id INTEGER NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
				id INTEGER NOT NULL,
				type TEXT NOT NULL,
				data TEXT NOT NULL,
				PRIMARY KEY (presentation_id, id)
			);
			PRAGMA user_version = ${SCHEMA_VERSION};
		`);
	}

	/** Esegue `work` in una transazione. */
	transaction(work) {
		this.db.exec('BEGIN');
		try {
			const result = work();
			this.db.exec('COMMIT');
			return result;
		} catch (err) {
			this.db.exec('ROLLBACK');
			throw err;
		}
	}

	presentationId(title) {
		return this.db.prepare('SELECT id FROM presentations WHERE title = ?').get(title)?.id;
	}

	touch(id) {
		this.db.prepare("UPDATE presentations SET updated_at = datetime('now') WHERE id = ?").run(id);
	}

	/** Titoli e sfondi (per le anteprime), dalla presentazione modificata più di recente. */
	list() {
		return this.db.prepare('SELECT title, background FROM presentations ORDER BY updated_at DESC, id DESC').all()
			.map((row) => ({ titolo: row.title, background: JSON.parse(row.background) }));
	}

	/** Presentazione nel formato del client ({ meta, proper }), undefined se non esiste. */
	get(title) {
		const row = this.db.prepare('SELECT id, background, paths FROM presentations WHERE title = ?').get(title);
		if (!row)
			return undefined;
		const proper = { paths: JSON.parse(row.paths), background: JSON.parse(row.background) };
		for (const collection of Object.values(COLLECTIONS))
			proper[collection] = [];
		const elements = this.db.prepare('SELECT type, data FROM elements WHERE presentation_id = ? ORDER BY rowid').all(row.id);
		for (const { type, data } of elements)
			proper[COLLECTIONS[type]]?.push(JSON.parse(data));
		return { meta: { titolo: title }, proper };
	}

	/** Crea una presentazione (vuota o con il contenuto `proper`); false se il titolo esiste già. */
	create(title, proper = {}) {
		if (this.presentationId(title) !== undefined)
			return false;
		return this.transaction(() => {
			const { lastInsertRowid } = this.db.prepare('INSERT INTO presentations (title, background, paths) VALUES (?, ?, ?)')
				.run(title, JSON.stringify(proper.background ?? emptyBackground()), JSON.stringify(proper.paths ?? emptyPaths()));
			const insert = this.db.prepare('INSERT INTO elements (presentation_id, id, type, data) VALUES (?, ?, ?, ?)');
			const seen = new Set();
			for (const [type, collection] of Object.entries(COLLECTIONS))
				for (const element of Array.isArray(proper[collection]) ? proper[collection] : []) {
					const id = Number(element?.id);
					// elementi senza id valido o duplicati vengono scartati
					if (!Number.isFinite(id) || seen.has(id))
						continue;
					seen.add(id);
					insert.run(lastInsertRowid, id, type, JSON.stringify({ ...element, id, type }));
				}
			return true;
		});
	}

	/** Copia la presentazione `title` con il nuovo titolo: 'missing', 'exists' o 'ok'. */
	copy(title, newTitle) {
		const original = this.get(title);
		if (!original)
			return 'missing';
		return this.create(newTitle, original.proper) ? 'ok' : 'exists';
	}

	remove(title) {
		this.db.prepare('DELETE FROM presentations WHERE title = ?').run(title);
	}

	/** Rinomina: 'missing', 'exists' o 'ok'. */
	rename(title, newTitle) {
		const id = this.presentationId(title);
		if (id === undefined)
			return 'missing';
		if (this.presentationId(newTitle) !== undefined)
			return 'exists';
		this.db.prepare("UPDATE presentations SET title = ?, updated_at = datetime('now') WHERE id = ?").run(newTitle, id);
		return 'ok';
	}

	/** Aggiunge un elemento; false se la presentazione non esiste o l'id è già usato. */
	addElement(title, element) {
		const id = this.presentationId(title);
		if (id === undefined)
			return false;
		const result = this.db.prepare('INSERT OR IGNORE INTO elements (presentation_id, id, type, data) VALUES (?, ?, ?, ?)')
			.run(id, Number(element.id), element.type, JSON.stringify({ ...element, id: Number(element.id) }));
		this.touch(id);
		return result.changes > 0;
	}

	/** Sostituisce un elemento esistente; false se non c'è. */
	replaceElement(title, element) {
		const id = this.presentationId(title);
		if (id === undefined)
			return false;
		const result = this.db.prepare('UPDATE elements SET type = ?, data = ? WHERE presentation_id = ? AND id = ?')
			.run(element.type, JSON.stringify({ ...element, id: Number(element.id) }), id, Number(element.id));
		this.touch(id);
		return result.changes > 0;
	}

	deleteElement(title, type, elementId) {
		const id = this.presentationId(title);
		if (id === undefined)
			return false;
		this.db.prepare('DELETE FROM elements WHERE presentation_id = ? AND id = ? AND type = ?').run(id, Number(elementId), type);
		this.touch(id);
		return true;
	}

	setBackground(title, background) {
		return this.db.prepare("UPDATE presentations SET background = ?, updated_at = datetime('now') WHERE title = ?")
			.run(JSON.stringify(background), title).changes > 0;
	}

	setPaths(title, paths) {
		return this.db.prepare("UPDATE presentations SET paths = ?, updated_at = datetime('now') WHERE title = ?")
			.run(JSON.stringify(paths), title).changes > 0;
	}

	/** Tutti i testi JSON salvati: servono a capire quali file multimediali sono ancora usati. */
	*contents() {
		for (const row of this.db.prepare('SELECT background AS data FROM presentations').iterate())
			yield row.data;
		for (const row of this.db.prepare('SELECT data FROM elements').iterate())
			yield row.data;
	}
}
