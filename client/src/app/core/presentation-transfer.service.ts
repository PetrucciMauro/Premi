/*
 * Esportazione e importazione delle presentazioni.
 * - JSON: le immagini caricate come file dalle versioni precedenti vengono incorporate in
 *   base64, così il file esportato non dipende dal server; audio e video restano indirizzi.
 * - HTML: una pagina autonoma con il player e tutti i media incorporati, che funziona fuori
 *   dall'app, senza server e senza connessione.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Presentation, Proper, imageUrls, mediaSrc, parseExport, toExport } from '../model/presentation';
import { standaloneHtml } from '../../standalone/html';
import { PresentationApi, readAsDataUrl } from './presentation-api.service';

/** immagine degli elementi audio (vedi slide-canvas.scss) */
const AUDIO_ICON = '/assets/nota.png';

const fileName = (title: string, extension: string) => `${title.replace(/[\\/:*?"<>|]+/g, '_')}.${extension}`;

@Injectable({ providedIn: 'root' })
export class PresentationTransfer {
  private readonly api = inject(PresentationApi);
  private readonly http = inject(HttpClient);

  /** Scarica la presentazione come file "<titolo>.json". */
  async export(title: string): Promise<void> {
    const { presentation } = await this.api.get(title);
    const json = JSON.stringify(toExport(await this.embed(presentation, imageUrls)), null, 2);
    this.download(new Blob([json], { type: 'application/json' }), fileName(title, 'json'));
  }

  /** Scarica la presentazione come pagina HTML autonoma "<titolo>.html". */
  async exportHtml(title: string): Promise<void> {
    const { presentation } = await this.api.get(title);
    const embedded = await this.embed(presentation, (proper) => [
      ...imageUrls(proper),
      ...proper.audios.map((el) => el.url),
      ...proper.videos.map((el) => el.url),
    ]);
    const audioIcon = embedded.proper.audios.length ? await this.dataUrl(AUDIO_ICON).catch(() => undefined) : undefined;
    this.download(new Blob([standaloneHtml(embedded, audioIcon)], { type: 'text/html' }), fileName(title, 'html'));
  }

  /** Legge un file esportato e restituisce la presentazione, senza salvarla. */
  async read(file: File): Promise<Presentation> {
    return parseExport(await file.text());
  }

  /** Salva sul server una presentazione importata con il titolo indicato. */
  import(presentation: Presentation, title: string): Promise<unknown> {
    return this.api.import({ ...presentation, meta: { ...presentation.meta, titolo: title } });
  }

  private download(blob: Blob, name: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href));
  }

  private async dataUrl(url: string): Promise<string> {
    return readAsDataUrl(await firstValueFrom(this.http.get(url, { responseType: 'blob' })));
  }

  /** Sostituisce gli indirizzi dei file salvati sul server (tra quelli di `urlsOf`) con i data URL corrispondenti. */
  private async embed(presentation: Presentation, urlsOf: (proper: Proper) => string[]): Promise<Presentation> {
    const urls = [...new Set(urlsOf(presentation.proper).filter((url) => url && !url.startsWith('data:')))];
    const embedded = new Map<string, string>();
    await Promise.all(
      urls.map(async (url) => {
        try {
          embedded.set(url, await this.dataUrl(mediaSrc(url)));
        } catch {
          // un file mancante resta col suo indirizzo
        }
      }),
    );
    if (!embedded.size) return presentation;

    const swap = (url: string) => embedded.get(url) ?? url;
    const proper = structuredClone(presentation.proper);
    proper.background.image = swap(proper.background.image);
    for (const frame of proper.frames) frame.ref = swap(frame.ref);
    for (const el of [...proper.images, ...proper.audios, ...proper.videos]) el.url = swap(el.url);
    return { ...presentation, proper };
  }
}
