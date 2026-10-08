import { describe, expect, it } from 'vitest';
import { Camera, cameraFor, zoomPath } from './view-transform';

const viewport = { width: 1600, height: 900 };

const expectCamera = (actual: Camera, expected: Camera) => {
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
  expect(actual.scale).toBeCloseTo(expected.scale, 6);
  expect(actual.rotation).toBeCloseTo(expected.rotation, 6);
};

describe('telecamera', () => {
  it('cameraFor inquadra il centro del rettangolo', () => {
    const camera = cameraFor(viewport, { xIndex: 100, yIndex: 50, width: 400, height: 300, rotation: 30 });
    expectCamera(camera, { x: 300, y: 200, scale: 3, rotation: 30 });
  });

  it('il percorso di zoom parte e arriva alle telecamere indicate', () => {
    const from = { x: 4000, y: 2000, scale: 0.2, rotation: 0 };
    const to = { x: 3900, y: 2400, scale: 9, rotation: 82 };
    const path = zoomPath(viewport, from, to);
    expectCamera(path.at(0), from);
    expectCamera(path.at(1), to);
    expect(path.length).toBeGreaterThan(0);
  });

  it('per i salti lunghi si allontana a metà percorso', () => {
    const from = { x: 500, y: 500, scale: 2, rotation: 0 };
    const to = { x: 7500, y: 3000, scale: 2, rotation: 0 };
    expect(zoomPath(viewport, from, to).at(0.5).scale).toBeLessThan(2);
  });

  it('ruota lungo l\'arco più breve e gestisce lo zoom senza spostamento', () => {
    const path = zoomPath(viewport, { x: 0, y: 0, scale: 1, rotation: 350 }, { x: 0, y: 0, scale: 4, rotation: 10 });
    expect(path.at(0.5).rotation).toBeCloseTo(360, 6);
    expect(path.at(1).scale).toBeCloseTo(4, 6);
  });
});
