/*
 * Presentazioni salvate per la consultazione offline.
 * Sostituisce l'Application Cache (rimossa dai browser): la presentazione e i suoi file
 * multimediali vengono conservati in IndexedDB, mentre l'applicazione è messa in cache
 * dal service worker di Angular.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Presentation, allElements, mediaSrc } from '../model/presentation';

export interface OfflinePresentation {
  titolo: string;
  presentation: Presentation;
  // file multimediali indicizzati con l'indirizzo usato nella presentazione
  media: Record<string, Blob>;
  savedAt: number;
}

const DB_NAME = 'premi-offline';
const STORE = 'presentations';

const promisify = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

@Injectable({ providedIn: 'root' })
export class OfflineStore {
  private readonly http = inject(HttpClient);
  private db?: Promise<IDBDatabase>;

  /** Titoli delle presentazioni disponibili offline. */
  readonly titles = signal<string[]>([]);

  constructor() {
    this.refresh().catch(() => this.titles.set([]));
  }

  async list(): Promise<OfflinePresentation[]> {
    const store = await this.store('readonly');
    return promisify(store.getAll() as IDBRequest<OfflinePresentation[]>);
  }

  async get(titolo: string): Promise<OfflinePresentation | undefined> {
    const store = await this.store('readonly');
    return promisify(store.get(titolo) as IDBRequest<OfflinePresentation | undefined>);
  }

  /** Scarica i file multimediali della presentazione e la salva in locale. */
  async save(presentation: Presentation): Promise<void> {
    const { proper } = presentation;
    const urls = new Set(
      [
        proper.background.image,
        ...proper.frames.map((f) => f.ref),
        ...allElements(proper).flatMap((el) => ('url' in el ? [el.url] : [])),
      ].filter((url) => url && !url.startsWith('data:')),
    );

    const media: Record<string, Blob> = {};
    await Promise.all(
      [...urls].map(async (url) => {
        try {
          media[url] = await firstValueFrom(this.http.get(mediaSrc(url), { responseType: 'blob' }));
        } catch {
          // un file mancante non impedisce di salvare il resto della presentazione
        }
      }),
    );

    const entry: OfflinePresentation = { titolo: presentation.meta.titolo, presentation, media, savedAt: Date.now() };
    const store = await this.store('readwrite');
    await promisify(store.put(entry));
    await this.refresh();
  }

  async remove(titolo: string): Promise<void> {
    const store = await this.store('readwrite');
    await promisify(store.delete(titolo));
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    const store = await this.store('readonly');
    const keys = await promisify(store.getAllKeys());
    this.titles.set(keys.map(String));
  }

  private async store(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    this.db ??= new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'titolo' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return (await this.db).transaction(STORE, mode).objectStore(STORE);
  }
}
