import { describe, expect, it } from 'vitest';
import { DEFAULT_CANVAS_WIDTH, imageUrls, normalizePresentation, parseExport, stripCssUrl, toExport, toHexColor } from './presentation';

describe('normalizePresentation', () => {
  it('converte i dati salvati dalla vecchia versione', () => {
    const p = normalizePresentation({
      meta: { titolo: 'Prova' },
      proper: {
        paths: { main: ['3', 5], choices: [] },
        texts: [{ id: '2', xIndex: '10', yIndex: 20, content: 'ciao', fontSize: '1.5' }],
        frames: [{ id: '3', ref: 'url("files/u/image/a.png")', bookmark: 1 }],
        images: [],
        SVGs: [],
        audios: [],
        videos: [],
        background: { id: 0, color: 'rgb(1,2,3)', image: 'url(files/u/image/b.png)', width: 1899, height: 919 },
      },
    });

    expect(p.meta.titolo).toBe('Prova');
    expect(p.proper.paths.main).toEqual([3, 5]);
    expect(p.proper.texts[0]).toMatchObject({ id: 2, xIndex: 10, fontSize: 1.5, font: 'Arial, Helvetica, sans-serif' });
    expect(p.proper.frames[0]).toMatchObject({ id: 3, ref: 'files/u/image/a.png', bookmark: 1 });
    expect(p.proper.background).toMatchObject({ image: 'files/u/image/b.png', width: 1899, height: 919 });
  });

  it('completa una presentazione appena creata', () => {
    const p = normalizePresentation({ meta: { titolo: 'Nuova' }, proper: { background: { id: 0 } } });
    expect(p.proper.frames).toEqual([]);
    expect(p.proper.background.width).toBe(DEFAULT_CANVAS_WIDTH);
    expect(p.proper.background.color).toBe('rgb(255,255,255)');
  });
});

describe('utility', () => {
  it('stripCssUrl', () => {
    expect(stripCssUrl("url('a b.png')")).toBe('a b.png');
    expect(stripCssUrl('files/x.png')).toBe('files/x.png');
    expect(stripCssUrl(undefined)).toBe('');
  });

  it('toHexColor', () => {
    expect(toHexColor('rgb(255, 0, 16)')).toBe('#ff0010');
    expect(toHexColor('rgba(255,255,255,0)')).toBe('#ffffff');
    expect(toHexColor('#ABC')).toBe('#aabbcc');
    expect(toHexColor('black', '#000000')).toBe('#000000');
  });
});

describe('esportazione JSON', () => {
  const presentation = normalizePresentation({
    meta: { titolo: 'Esportata' },
    proper: {
      images: [{ id: 1, url: 'data:image/png;base64,AAAA' }],
      frames: [{ id: 2, ref: 'files/u/image/a.png' }],
      background: { id: 0, image: '' },
    },
  });

  it('rilegge il file esportato', () => {
    expect(parseExport(JSON.stringify(toExport(presentation)))).toEqual(presentation);
  });

  it('accetta anche un documento senza involucro', () => {
    expect(parseExport(JSON.stringify({ _id: 'x', ...presentation }))).toEqual(presentation);
  });

  it('rifiuta file non validi', () => {
    expect(() => parseExport('non json')).toThrow('JSON valido');
    expect(() => parseExport('{"a":1}')).toThrow('presentazione');
    expect(() => parseExport(JSON.stringify({ ...toExport(presentation), version: 99 }))).toThrow('più recente');
  });

  it('elenca le immagini usate', () => {
    expect(imageUrls(presentation.proper)).toEqual(['files/u/image/a.png', 'data:image/png;base64,AAAA']);
  });
});
