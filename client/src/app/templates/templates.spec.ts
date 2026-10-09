import { describe, expect, it } from 'vitest';
import { allElements, anchorChain, normalizePresentation } from '../model/presentation';
import { TEMPLATES } from './templates';

describe('modelli', () => {
  for (const template of TEMPLATES) {
    describe(template.name, () => {
      const proper = template.build();

      it('ha un percorso e ogni frame sta in un solo percorso', () => {
        expect(proper.paths.main.length).toBeGreaterThan(1);
        const inPaths = [...proper.paths.main, ...proper.paths.choices.flatMap((s) => s.choicePath)];
        expect(new Set(inPaths).size).toBe(inPaths.length);
        for (const id of inPaths) expect(proper.frames.some((f) => f.id === id)).toBe(true);
      });

      it('ogni testo è associato a un frame, sopra di esso e dentro la tela', () => {
        const { width, height } = proper.background;
        for (const text of proper.texts) {
          const frame = proper.frames.find((f) => f.id === text.anchor?.frame);
          expect(frame, `testo ${text.id}`).toBeDefined();
          expect(text.zIndex).toBeGreaterThan(frame!.zIndex);
          expect(text.xIndex).toBeGreaterThanOrEqual(0);
          expect(text.yIndex).toBeGreaterThanOrEqual(0);
          expect(text.xIndex + text.width).toBeLessThanOrEqual(width);
          expect(text.yIndex + text.height).toBeLessThanOrEqual(height);
        }
      });

      it('i sottopercorsi partono da frame del percorso con un loro elemento', () => {
        for (const sub of proper.paths.choices) {
          expect(proper.paths.main).toContain(sub.frame);
          const trigger = allElements(proper).find((el) => el.id === sub.trigger)!;
          expect(anchorChain(proper, trigger)).toContain(sub.frame);
        }
      });

      it('sopravvive al salvataggio (normalizzazione del server)', () => {
        const saved = normalizePresentation(JSON.parse(JSON.stringify({ meta: { titolo: 'x' }, proper })));
        expect(saved.proper).toEqual(proper);
      });
    });
  }

  it('ogni modello è una copia nuova', () => {
    expect(TEMPLATES[0].build()).not.toBe(TEMPLATES[0].build());
  });
});
