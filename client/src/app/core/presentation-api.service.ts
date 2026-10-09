/*
 * Chiamate REST al server locale (/private/api): presentazioni e file multimediali.
 * I media sono file separati dalla presentazione, che ne contiene solo l'indirizzo ("media/...").
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import {
  Background,
  ElementType,
  MediaType,
  Paths,
  Presentation,
  PresentationMeta,
  SlideElement,
  normalizePresentation,
} from '../model/presentation';

interface ServerResponse<T = unknown> {
  success: boolean;
  message: T;
}

const PRESENTATIONS = '/private/api/presentations';
const MEDIA = '/private/api/media';
const enc = encodeURIComponent;

@Injectable({ providedIn: 'root' })
export class PresentationApi {
  private readonly http = inject(HttpClient);

  /** Titoli delle presentazioni, con lo sfondo per le anteprime. */
  list(): Promise<(PresentationMeta & { background?: Background })[]> {
    return firstValueFrom(
      this.http
        .get<ServerResponse<(PresentationMeta & { background?: Background })[]>>(PRESENTATIONS)
        .pipe(map((r) => r.message)),
    );
  }

  /** Restituisce la presentazione normalizzata e il documento originale salvato sul server. */
  async get(title: string): Promise<{ presentation: Presentation; raw: unknown }> {
    const res = await firstValueFrom(this.http.get<ServerResponse>(`${PRESENTATIONS}/${enc(title)}`));
    return { presentation: normalizePresentation(res.message), raw: res.message };
  }

  create(title: string): Promise<unknown> {
    return firstValueFrom(this.http.post(`${PRESENTATIONS}/new/${enc(title)}`, null));
  }

  remove(title: string): Promise<unknown> {
    return firstValueFrom(this.http.delete(`${PRESENTATIONS}/${enc(title)}`));
  }

  rename(title: string, newTitle: string): Promise<unknown> {
    return firstValueFrom(this.http.post(`${PRESENTATIONS}/${enc(title)}/rename/${enc(newTitle)}`, null));
  }

  newElement(title: string, element: SlideElement): Promise<unknown> {
    return firstValueFrom(this.http.post(`${PRESENTATIONS}/${enc(title)}/element`, { element }));
  }

  updateElement(title: string, element: SlideElement | Background): Promise<unknown> {
    return firstValueFrom(this.http.put(`${PRESENTATIONS}/${enc(title)}/element`, { element }));
  }

  deleteElement(title: string, type: ElementType, id: number): Promise<unknown> {
    return firstValueFrom(this.http.delete(`${PRESENTATIONS}/${enc(title)}/delete/${type}/${id}`));
  }

  updatePaths(title: string, paths: Paths): Promise<unknown> {
    return firstValueFrom(this.http.put(`${PRESENTATIONS}/${enc(title)}/paths`, { element: paths }));
  }

  /** Crea una nuova presentazione a partire da una esportata in JSON. */
  import(presentation: Presentation): Promise<unknown> {
    return firstValueFrom(this.http.post(`${PRESENTATIONS}/import`, { presentation }));
  }
}

/** Contenuto di un file (o blob) come data URL base64. */
export function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Impossibile leggere il file'));
    reader.readAsDataURL(blob);
  });
}

/** Tipo di media in base al MIME type del file, undefined se non supportato. */
export function mediaType(file: File): MediaType | undefined {
  const kind = file.type.split('/')[0];
  return kind === 'image' || kind === 'audio' || kind === 'video' ? kind : undefined;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);

  /**
   * Carica il file (immagine, audio o video) nell'archivio locale e restituisce l'indirizzo
   * con cui referenziarlo nella presentazione. Non ci sono limiti di dimensione.
   */
  async upload(file: File): Promise<{ type: MediaType; url: string }> {
    const type = mediaType(file);
    if (!type) throw new Error(`Formato del file "${file.name}" non supportato`);
    const body = new FormData();
    body.append('file', file);
    const res = await firstValueFrom(this.http.post<{ success: boolean; type: MediaType; url: string }>(MEDIA, body));
    return { type: res.type, url: res.url };
  }
}
