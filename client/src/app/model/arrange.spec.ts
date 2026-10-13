import { describe, expect, it } from 'vitest';
import { alignElements, alignmentGuides, distributeElements, snapMove } from './arrange';
import { Proper, findElement, normalizePresentation, syncAnchors } from './presentation';

const make = (texts: object[], frames: object[] = []): Proper =>
  normalizePresentation({
    proper: { texts, frames, background: { color: 'white', image: '', width: 1000, height: 500 } },
  }).proper;

const box = (id: number, x: number, y: number, width = 100, height = 50, extra = {}) => ({
  id, zIndex: id, xIndex: x, yIndex: y, width, height, rotation: 0, ...extra,
});

const pos = (proper: Proper, id: number) => {
  const el = findElement(proper, id)!;
  return [el.xIndex, el.yIndex];
};

describe('posizionamento nel contenitore', () => {
  it('porta un elemento libero ai bordi e al centro della tela', () => {
    const proper = make([box(1, 200, 100)]);
    alignElements(proper, [1], 'right');
    expect(pos(proper, 1)).toEqual([900, 100]);
    alignElements(proper, [1], 'bottom');
    expect(pos(proper, 1)).toEqual([900, 450]);
    alignElements(proper, [1], 'center');
    expect(pos(proper, 1)).toEqual([450, 225]);
  });

  it('considera il rettangolo che contiene un elemento ruotato', () => {
    const proper = make([box(1, 200, 100, 100, 50, { rotation: 90 })]);
    alignElements(proper, [1], 'left');
    // ruotato di 90° occupa 50 in larghezza: il centro sta a 25 dal bordo
    const [x] = pos(proper, 1);
    expect(x + 50).toBeCloseTo(25);
  });

  it('dispone un elemento associato nel sistema di riferimento del frame ruotato', () => {
    const frame = box(1, 100, 100, 400, 200, { rotation: 90, type: 'frame' });
    const proper = make([box(2, 250, 175, 100, 50, { rotation: 90, anchor: { frame: 1, x: 0, y: 0, width: 0, height: 0, rotation: 0 } })], [frame]);
    syncAnchors(null, proper);
    const before = structuredClone(proper);
    alignElements(proper, [2], 'left');
    syncAnchors(before, proper);
    const el = findElement(proper, 2)!;
    // il bordo sinistro del frame (non ruotato) è in alto sullo schermo
    expect(el.anchor!.x * 400).toBeCloseTo(50);
    expect(el.anchor!.y).toBeCloseTo(0.5);
    expect(el.xIndex + el.width / 2).toBeCloseTo(300);
    expect(el.yIndex + el.height / 2).toBeCloseTo(50);
  });
});

describe('allineamento di più elementi', () => {
  it('allinea al bordo del gruppo, non della tela', () => {
    const proper = make([box(1, 100, 50), box(2, 300, 200, 50), box(3, 500, 100, 200)]);
    alignElements(proper, [1, 2, 3], 'right');
    expect([1, 2, 3].map((id) => { const el = findElement(proper, id)!; return el.xIndex + el.width; })).toEqual([700, 700, 700]);
    alignElements(proper, [1, 2, 3], 'top');
    expect([1, 2, 3].map((id) => pos(proper, id)[1])).toEqual([50, 50, 50]);
  });

  it('con toContainer porta ciascuno ai bordi del contenitore', () => {
    const proper = make([box(1, 100, 50), box(2, 300, 200)]);
    alignElements(proper, [1, 2], 'left', true);
    expect([pos(proper, 1)[0], pos(proper, 2)[0]]).toEqual([0, 0]);
  });

  it('ignora gli elementi di un altro contenitore', () => {
    const frame = box(9, 0, 0, 500, 500, { type: 'frame' });
    const anchor = { frame: 9, x: 0, y: 0, width: 0, height: 0, rotation: 0 };
    const proper = make([box(1, 100, 50), box(2, 300, 200, 100, 50, { anchor })], [frame]);
    alignElements(proper, [1, 2], 'left');
    expect(pos(proper, 2)).toEqual([300, 200]);
  });
});

describe('distribuzione', () => {
  it('lascia spazi uguali tenendo fermi il primo e l\'ultimo', () => {
    const proper = make([box(1, 0, 0, 100), box(2, 120, 0, 50), box(3, 600, 0, 100), box(4, 400, 0, 50)]);
    distributeElements(proper, [1, 2, 3, 4], 'x');
    // spazio libero: 700 - 300 = 400, tre intervalli
    const gap = 400 / 3;
    expect(pos(proper, 1)[0]).toBe(0);
    expect(pos(proper, 2)[0]).toBeCloseTo(100 + gap, 1);
    expect(pos(proper, 4)[0]).toBeCloseTo(150 + 2 * gap, 1);
    expect(pos(proper, 3)[0]).toBe(600);
  });

  it('non fa nulla con meno di tre elementi', () => {
    const proper = make([box(1, 0, 0), box(2, 0, 300)]);
    distributeElements(proper, [1, 2], 'y');
    expect(pos(proper, 2)).toEqual([0, 300]);
  });
});

describe('guide durante il trascinamento', () => {
  it('aggancia il bordo vicino a quello di un altro elemento', () => {
    const proper = make([box(1, 100, 300, 120), box(2, 403, 100)]);
    // spostando 1 di (300, 0) il bordo sinistro finisce a 400, 3 dal bordo di 2
    expect(snapMove(proper, [1], 300, 0, 6)).toEqual([303, 0]);
    // lontano più di 6 da bordi e centri di 2 e della tela
    expect(snapMove(proper, [1], 270, 0, 6)).toEqual([270, 0]);
  });

  it('mostra una guida per bordi e centri allineati', () => {
    const proper = make([box(1, 100, 300), box(2, 300, 100)]);
    const guides = alignmentGuides(proper, [1], 200, 0)!;
    expect(guides.container).toBeNull();
    // bordo sinistro, centro e bordo destro coincidono: tre guide verticali da 2 a 1
    expect(guides.lines).toEqual([
      { axis: 'x', at: 300, from: 100, to: 350 },
      { axis: 'x', at: 350, from: 100, to: 350 },
      { axis: 'x', at: 400, from: 100, to: 350 },
    ]);
    expect(alignmentGuides(proper, [1], 190, 7)).toBeNull();
  });

  it('considera il contenitore e ignora gli elementi di altri contenitori', () => {
    const frame = box(9, 0, 0, 200, 200, { type: 'frame' });
    const anchor = { frame: 9, x: 0, y: 0, width: 0, height: 0, rotation: 0 };
    const proper = make([box(1, 50, 30, 80, 50, { anchor }), box(2, 600, 120)], [frame]);
    syncAnchors(null, proper);
    const guides = alignmentGuides(proper, [1], -50, 0)!;
    expect(guides.container).toBe(9);
    expect(guides.lines).toEqual([{ axis: 'x', at: 0, from: 0, to: 200 }]);
  });
});
