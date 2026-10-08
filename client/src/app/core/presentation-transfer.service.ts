/*
 * Esportazione e importazione delle presentazioni come file JSON.
 * Le immagini caricate come file dalle versioni precedenti vengono incorporate in base64,
 * così il file esportato non dipende dal server; audio e video restano indirizzi.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Presentation, imageUrls, mediaSrc, parseExport, toExport } from '../model/presentation';
import { PresentationApi, readAsDataUrl } from './presentation-api.service';

@Injectable({ providedIn: 'root' })
export class PresentationTransfer {
  private readonly api = inject(PresentationApi);
  private readonly http = inject(HttpClient);

  /** Scarica la presentazione come file "<titolo>.json". */
  async export(title: string): Promise<void> {
    const { presentation } = await this.api.get(title);
    const json = JSON.stringify(toExport(await this.embedImages(presentation)), null, 2);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    link.download = `${title.replace(/[\\/:*?"<>|]+/g, '_')}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href));
  }

  /** Legge un file esportato e restituisce la presentazione, senza salvarla. */
  async read(file: File): Promise<Presentation> {
    return parseExport(await file.text());
  }

  /** Salva sul server una presentazione importata con il titolo indicato. */
  import(presentation: Presentation, title: string): Promise<unknown> {
    return this.api.import({ ...presentation, meta: { ...presentation.meta, titolo: title } });
  }

  /** Sostituisce gli indirizzi delle immagini salvate sul server con i data URL corrispondenti. */
  private async embedImages(presentation: Presentation): Promise<Presentation> {
    const urls = [...new Set(imageUrls(presentation.proper).filter((url) => !url.startsWith('data:')))];
    const embedded = new Map<string, string>();
    await Promise.all(
      urls.map(async (url) => {
        try {
          const blob = await firstValueFrom(this.http.get(mediaSrc(url), { responseType: 'blob' }));
          embedded.set(url, await readAsDataUrl(blob));
        } catch {
          // un'immagine mancante resta col suo indirizzo
        }
      }),
    );
    if (!embedded.size) return presentation;

    const swap = (url: string) => embedded.get(url) ?? url;
    const proper = structuredClone(presentation.proper);
    proper.background.image = swap(proper.background.image);
    for (const frame of proper.frames) frame.ref = swap(frame.ref);
    for (const image of proper.images) image.url = swap(image.url);
    return { ...presentation, proper };
  }
}
