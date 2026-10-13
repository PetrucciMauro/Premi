import { describe, expect, it } from 'vitest';
import '../../testing/dom-matrix';
import { normalizePresentation, Proper, SlideElement } from '../model/presentation';
import { CameraView, cameraFor, cameraMatrix, cameraTilt, focusCamera, perspectiveFor } from './camera';
import { culledElements, floorMode, floorTiles, hiddenFrom, sceneCorners, tileCorners } from './culling';

const viewport = { width: 1600, height: 900 };
const view = (camera: ReturnType<typeof cameraFor>): CameraView => ({ matrix: cameraMatrix(viewport, camera, perspectiveFor(viewport)), viewport, tilt: cameraTilt(camera) });
const focus = (proper: Proper, el: SlideElement) => view(focusCamera(viewport, proper, el));

// un frame girato di taglio (un "muro" che si alza dalla tela) e, dal lato da cui lo guarda
// la telecamera (+x), un frame grande sulla tela; più un frame lontano
const { proper } = normalizePresentation({
  proper: {
    background: { width: 16000, height: 8000 },
    frames: [
      { id: 1, zIndex: 0, xIndex: 5000, yIndex: 3000, width: 1300, height: 731, rotateY: 90 },
      { id: 2, zIndex: 1, xIndex: 6000, yIndex: 2500, width: 3000, height: 1700 },
      { id: 3, zIndex: 2, xIndex: 200, yIndex: 200, width: 1000, height: 560 },
    ],
    texts: [{ id: 4, zIndex: 3, xIndex: 5100, yIndex: 3100, width: 600, height: 100, anchor: { frame: 1, x: 0.3, y: 0.2, width: 0.46, height: 0.14, rotation: 0 } }],
  },
});

const toWall = focus(proper, proper.frames[0]);
const overview = view(cameraFor(viewport, { xIndex: 0, yIndex: 0, rotation: 0, ...proper.background }));

describe('superfici da non disegnare', () => {
  it("nella vista d'insieme mostra gli elementi e la tela intera", () => {
    const culled = culledElements(sceneCorners(proper), overview);
    expect(culled.has(2)).toBe(false);
    expect(culled.has(3)).toBe(false);
    expect(floorMode(overview, 16000, 8000)).toBe('whole');
  });

  it("guardando un frame di taglio la tela, vista troppo di scorcio, non si disegna", () => {
    expect(toWall.tilt).toBeCloseTo(90);
    expect(floorMode(toWall, 16000, 8000)).toBe('none');
  });

  it('nasconde ciò che sta dietro la telecamera o fuori dallo schermo, non il frame inquadrato né il suo testo', () => {
    const culled = culledElements(sceneCorners(proper), toWall);
    expect(culled.has(2)).toBe(true); // dietro l'occhio
    expect(culled.has(3)).toBe(true); // fuori dallo schermo
    expect(culled.has(1)).toBe(false);
    expect(culled.has(4)).toBe(false);
  });

  it("con la tela di taglio nasconde anche ciò che vi è appoggiato, ma non ciò che sta sui piani inclinati", () => {
    const culled = culledElements(sceneCorners(proper), toWall, true);
    expect(culled.has(2)).toBe(true);
    expect(culled.has(3)).toBe(true);
    expect(culled.has(1)).toBe(false);
    expect(culled.has(4)).toBe(false);
  });

  it('inquadrando un frame sulla tela nasconde i frame lontani', () => {
    const culled = culledElements(sceneCorners(proper), focus(proper, proper.frames[2]));
    expect(culled.has(3)).toBe(false);
    expect(culled.has(2)).toBe(true);
  });

  it("non nasconde un frame solo un po' inclinato né la tela attorno", () => {
    const { proper: tilted } = normalizePresentation({
      proper: { background: { width: 16000, height: 8000 }, frames: [{ id: 1, zIndex: 0, xIndex: 5000, yIndex: 3000, width: 1300, height: 731, rotateY: 35 }] },
    });
    const camera = focus(tilted, tilted.frames[0]);
    expect(culledElements(sceneCorners(tilted), camera).size).toBe(0);
    expect(camera.tilt).toBeCloseTo(35);
    // la tela (grande) arriva dietro l'occhio: si divide in tessere, e quelle vicine restano
    expect(floorMode(camera, 16000, 8000)).toBe('tiles');
    const kept = floorTiles(16000, 8000).filter((tile) => !hiddenFrom(camera, tileCorners(tile)));
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.some((t) => t.x <= 5650 && t.x + t.width >= 5650 && t.y <= 3365 && t.y + t.height >= 3365)).toBe(true);
  });
});
