import { describe, expect, it } from 'vitest';
import '../../testing/dom-matrix';
import {
  DEFAULT_CANVAS_WIDTH,
  elementTransform,
  frameLift,
  imageUrls,
  normalizePresentation,
  parseExport,
  stripCssUrl,
  tiltLayers,
  toExport,
  toHexColor,
} from './presentation';

describe('rotazione 3D dei frame', () => {
  const { proper } = normalizePresentation({
    proper: {
      frames: [{ id: 1, zIndex: 0, xIndex: 0, yIndex: 0, width: 200, height: 100, rotation: 20, rotateX: 30, rotateY: 15 }],
      texts: [
        { id: 2, zIndex: 1, xIndex: 120, yIndex: 60, width: 40, height: 20, rotation: 5, anchor: { frame: 1, x: 0.7, y: 0.7, width: 0.2, height: 0.2, rotation: -15 } },
        { id: 3, zIndex: 2, xIndex: 0, yIndex: 0, width: 10, height: 10, rotation: 45 },
      ],
    },
  });
  const [frame] = proper.frames;
  const [child, free] = proper.texts;

  /** posizione sullo schermo di un punto dell'elemento (transform-origin al centro) */
  const render = (el: typeof child | typeof frame, x: number, y: number) => {
    const ox = el.xIndex + el.width / 2;
    const oy = el.yIndex + el.height / 2;
    const m = new DOMMatrix().translate(ox, oy).multiply(new DOMMatrix(elementTransform(proper, el))).translate(-ox, -oy);
    return m.transformPoint(new DOMPoint(x, y));
  };

  it('gli elementi non inclinati usano una semplice rotazione', () => {
    expect(elementTransform(proper, free)).toBe('rotate(45deg)');
  });

  it('gli elementi associati restano sul piano del frame inclinato', () => {
    // il piano del frame passa per i suoi angoli: il punto del testo deve essere complanare
    const a = render(frame, 0, 0);
    const b = render(frame, 200, 0);
    const c = render(frame, 0, 100);
    const p = render(child, 125, 65);
    const n = [
      (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y),
      (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z),
      (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x),
    ];
    const distance = (n[0] * (p.x - a.x) + n[1] * (p.y - a.y) + n[2] * (p.z - a.z)) / Math.hypot(...n);
    expect(distance).toBeCloseTo(0, 6);
  });

  it('sul piano inclinato gli elementi più in alto stanno davanti al frame', () => {
    const layers = tiltLayers(proper);
    expect(layers.get(1)).toBe(0);
    expect(layers.get(2)).toBe(1);
    expect(layers.has(3)).toBe(false);
    // il testo staccato dal frame verso lo spettatore: davanti al piano del frame
    const ox = child.xIndex + child.width / 2;
    const oy = child.yIndex + child.height / 2;
    const at = (layer: number) =>
      new DOMMatrix().translate(ox, oy).multiply(new DOMMatrix(elementTransform(proper, child, layer))).translate(-ox, -oy).transformPoint(new DOMPoint(ox, oy));
    const flat = at(0);
    const lifted = at(1);
    expect(Math.hypot(lifted.x - flat.x, lifted.y - flat.y, lifted.z - flat.z)).toBeCloseTo(0.5, 6);
  });

  it('il frame inclinato resta davanti al piano della tela', () => {
    for (const [x, y] of [[0, 0], [200, 0], [0, 100], [200, 100]]) expect(render(frame, x, y).z).toBeGreaterThan(0);
    expect(frameLift(frame)).toBeGreaterThan(0);
  });
});

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
    expect(p.proper.frames[0]).toMatchObject({ id: 3, ref: 'files/u/image/a.png', bookmark: 1, fit: 'fill' });
    expect(p.proper.texts[0].anchor).toBeUndefined();
    expect(p.proper.background).toMatchObject({ image: 'files/u/image/b.png', width: 1899, height: 919 });
  });

  it('conserva associazione ai frame e adattamento dello sfondo', () => {
    const anchor = { frame: 1, x: 0.5, y: 0.5, width: 0.2, height: 0.1, rotation: 0, fontSize: 0.01 };
    const p = normalizePresentation({
      proper: {
        frames: [{ id: 1, fit: 'contain' }, { id: 3, fit: 'boh', anchor: { frame: 'x' } }],
        images: [{ id: 2, anchor }],
      },
    });
    expect(p.proper.frames.map((f) => f.fit)).toEqual(['contain', 'fill']);
    expect(p.proper.frames[1].anchor).toBeUndefined();
    expect(p.proper.images[0].anchor).toEqual(anchor);
  });

  it('legge i sottopercorsi e scarta le scelte del vecchio formato', () => {
    const p = normalizePresentation({
      proper: {
        paths: {
          main: [1],
          choices: [{ id: 3, frame: '1', trigger: '7', choicePath: ['4', 5] }, { id: 4, frame: 1, choicePath: [] }, { path: [2] }],
        },
      },
    });
    expect(p.proper.paths.choices).toEqual([
      { id: 3, frame: 1, trigger: 7, choicePath: [4, 5] },
      { id: 4, frame: 1, trigger: null, choicePath: [] },
    ]);
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
