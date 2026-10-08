/*
 * Chiamate REST verso /private/api: presentazioni e file multimediali.
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
import { AuthService } from './auth.service';

interface ServerResponse<T = unknown> {
  success: boolean;
  message: T;
}

const PRESENTATIONS = '/private/api/presentations';
const FILES = '/private/api/files';
const enc = encodeURIComponent;

@Injectable({ providedIn: 'root' })
export class PresentationApi {
  private readonly http = inject(HttpClient);

  list(): Promise<PresentationMeta[]> {
    return firstValueFrom(
      this.http.get<ServerResponse<PresentationMeta[]>>(PRESENTATIONS).pipe(map((r) => r.message)),
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

// un documento MongoDB non può superare i 16 MB e il base64 aumenta la dimensione di un terzo
export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

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
  private readonly auth = inject(AuthService);

  /**
   * Restituisce l'indirizzo con cui referenziare il file nella presentazione: le immagini
   * vengono incorporate come data URL base64, audio e video sono caricati sul server.
   */
  async upload(file: File): Promise<{ type: MediaType; url: string }> {
    const type = mediaType(file);
    if (!type) throw new Error(`Formato del file "${file.name}" non supportato`);

    if (type === 'image') {
      if (file.size > MAX_IMAGE_SIZE)
        throw new Error(`L'immagine "${file.name}" è troppo grande (massimo ${MAX_IMAGE_SIZE / 1024 / 1024} MB)`);
      return { type, url: await readAsDataUrl(file) };
    }

    const name = file.name.replace(/\.[^.]*$/, '') || file.name;
    const body = new FormData();
    body.append('file', file);
    const res = await firstValueFrom(
      this.http.post<{ success: boolean; name: string }>(`${FILES}/${type}/${enc(name)}`, body),
    );
    return { type, url: `files/${this.auth.username()}/${type}/${res.name}` };
  }
}
