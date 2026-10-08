/*
 * Calcolo della "telecamera" che inquadra la tela: usata dall'editor per lo zoom
 * e dal player per spostarsi da un frame all'altro (al posto di impress.js).
 */

export interface Size {
  width: number;
  height: number;
}

export interface Target {
  xIndex: number;
  yIndex: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Matrice che porta il rettangolo `target` (in coordinate della tela) al centro della
 * finestra `viewport`, scalato per occupare la frazione `fill` e raddrizzato se ruotato.
 * Va applicata alla tela con transform-origin 0 0.
 */
export function viewMatrix(viewport: Size, target: Target, fill = 1): DOMMatrix {
  const scale = Math.min(
    (viewport.width * fill) / Math.max(target.width, 1),
    (viewport.height * fill) / Math.max(target.height, 1),
  );
  return new DOMMatrix()
    .translate(viewport.width / 2, viewport.height / 2)
    .scale(scale)
    .rotate(-target.rotation)
    .translate(-(target.xIndex + target.width / 2), -(target.yIndex + target.height / 2));
}

/** Matrice che mostra tutta la tela. */
export function overviewMatrix(viewport: Size, canvas: Size, fill = 1): DOMMatrix {
  return viewMatrix(viewport, { xIndex: 0, yIndex: 0, rotation: 0, ...canvas }, fill);
}

export const cssMatrix = (m: DOMMatrix): string => m.toString();
