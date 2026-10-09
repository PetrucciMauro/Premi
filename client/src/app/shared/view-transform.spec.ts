import { describe, expect, it } from 'vitest';
import '../../testing/dom-matrix';
import { normalizePresentation, planeMatrix } from '../model/presentation';
import { Camera, cameraFor, cameraMatrix, focusCamera, layoutZoom, perspectiveFor, unproject, zoomPath } from './view-transform';

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

  it('raddrizza un frame inclinato e interpola la rotazione 3D', () => {
    const vp = { width: 1000, height: 500 };
    const frame = { xIndex: 100, yIndex: 100, width: 200, height: 100, rotation: 30, rotateX: 40, rotateY: -25 };
    const camera = cameraFor(vp, { ...frame, z: 10 });
    // il frame nella sua posizione 3D, come lo disegna la tela
    const world = new DOMMatrix()
      .translate(200, 150, 10)
      .rotate(30)
      .rotateAxisAngle(1, 0, 0, 40)
      .rotateAxisAngle(0, 1, 0, -25)
      .translate(-200, -150);
    const screen = cameraMatrix(vp, camera, 1200).multiply(world);
    // gli angoli del frame tornano sul piano dello schermo, centrati e senza rotazione
    const corner = screen.transformPoint(new DOMPoint(100, 100));
    expect(corner.z).toBeCloseTo(0, 6);
    expect(corner.x / corner.w).toBeCloseTo(500 - 100 * camera.scale, 6);
    expect(corner.y / corner.w).toBeCloseTo(250 - 50 * camera.scale, 6);

    const path = zoomPath(vp, { x: 0, y: 0, scale: 1, rotation: 0 }, camera);
    expect(path.at(0.5).rotateX).toBeCloseTo(20, 6);
    expect(path.at(1).z).toBeCloseTo(10, 6);
  });

  it('inquadra di fronte un frame inclinato e i suoi elementi, e ritrova il punto sotto il puntatore', () => {
    const vp = { width: 1000, height: 500 };
    const { proper } = normalizePresentation({
      proper: {
        frames: [{ id: 1, xIndex: 100, yIndex: 100, width: 200, height: 100, rotation: 30, rotateX: 40, rotateY: -25 }],
        texts: [{ id: 2, xIndex: 150, yIndex: 120, width: 40, height: 20, rotation: 30, anchor: { frame: 1, x: 0.35, y: 0.3, width: 0.2, height: 0.2, rotation: 0 } }],
      },
    });
    const [frame] = proper.frames;
    const [text] = proper.texts;

    const camera = focusCamera(vp, proper, frame);
    const screen = cameraMatrix(vp, camera, perspectiveFor(vp)).multiply(planeMatrix(proper, frame, true));
    const project = (x: number, y: number) => {
      const p = screen.transformPoint(new DOMPoint(x, y));
      return { x: p.x / p.w, y: p.y / p.w, z: p.z };
    };
    // il frame appare dritto, centrato e parallelo allo schermo
    expect(project(100, 100).z).toBeCloseTo(0, 6);
    expect(project(300, 200).z).toBeCloseTo(0, 6);
    expect(project(200, 150).x).toBeCloseTo(500, 6);
    expect(project(200, 150).y).toBeCloseTo(250, 6);
    // angoli del lato superiore del frame (ruotato di 30° attorno al centro): appaiono orizzontali
    const corner = (lx: number, ly: number) => project(200 + lx * Math.cos(Math.PI / 6) - ly * Math.sin(Math.PI / 6), 150 + lx * Math.sin(Math.PI / 6) + ly * Math.cos(Math.PI / 6));
    expect(corner(-100, -50).y).toBeCloseTo(corner(100, -50).y, 6);
    expect(corner(100, -50).x - corner(-100, -50).x).toBeCloseTo(200 * camera.scale, 6);
    // dalla posizione sullo schermo si ritrova il punto della tela
    const back = unproject(screen, project(120, 170).x, project(120, 170).y);
    expect(back.x).toBeCloseTo(120, 6);
    expect(back.y).toBeCloseTo(170, 6);

    // zoom su un testo del frame: stessa rotazione del frame, centrato sul testo
    const onText = focusCamera(vp, proper, text);
    expect(onText).toMatchObject({ rotation: 30, rotateX: 40, rotateY: -25 });
    const center = cameraMatrix(vp, onText, perspectiveFor(vp)).multiply(planeMatrix(proper, text, true)).transformPoint(new DOMPoint(170, 130));
    expect(center.x / center.w).toBeCloseTo(500, 6);
    expect(center.y / center.w).toBeCloseTo(250, 6);

    // con una telecamera inclinata il piano della tela non è più parallelo: unproject ne tiene conto
    const tilted = cameraMatrix(vp, camera, perspectiveFor(vp));
    const q = tilted.transformPoint(new DOMPoint(700, 40));
    const hit = unproject(tilted, q.x / q.w, q.y / q.w);
    expect(hit.x).toBeCloseTo(700, 6);
    expect(hit.y).toBeCloseTo(40, 6);
  });

  it('ruota lungo l\'arco più breve e gestisce lo zoom senza spostamento', () => {
    const path = zoomPath(viewport, { x: 0, y: 0, scale: 1, rotation: 350 }, { x: 0, y: 0, scale: 4, rotation: 10 });
    expect(path.at(0.5).rotation).toBeCloseTo(360, 6);
    expect(path.at(1).scale).toBeCloseTo(4, 6);
  });

  it('la scala di impaginazione cambia a passi e resta vicina a quella della telecamera', () => {
    expect(layoutZoom(1, 1)).toBe(1);
    expect(layoutZoom(1.1, 1)).toBe(1);
    const z = layoutZoom(8, 1);
    expect(8 / z).toBeGreaterThan(0.9);
    expect(8 / z).toBeLessThan(1.1);
    expect(layoutZoom(8.3, z)).toBe(z);
    expect(layoutZoom(0.2, z)).toBeLessThan(0.23);
  });
});
