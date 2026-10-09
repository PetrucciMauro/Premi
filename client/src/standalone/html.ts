/*
 * File HTML autonomo di una presentazione: player (JS e CSS) e dati incorporati in un'unica
 * pagina, che si apre con un doppio clic su qualsiasi dispositivo, anche senza connessione.
 */
import type { Presentation } from '../app/model/presentation';
import type { StandaloneData } from './player';
import { PLAYER_CSS, PLAYER_JS } from './runtime.generated';

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Pagina HTML con la presentazione; i media devono essere già incorporati come data URL. */
export function standaloneHtml(presentation: Presentation, audioIcon?: string): string {
  const data: StandaloneData = { presentation, audioIcon };
  // "<" codificato: il contenuto non può chiudere il tag <script>
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="generator" content="Premi">
<title>${escapeHtml(presentation.meta.titolo || 'Presentazione')}</title>
<style>${PLAYER_CSS}</style>
</head>
<body>
<noscript>Per vedere la presentazione è necessario attivare JavaScript.</noscript>
<script type="application/json" id="premi-data">${json}</script>
<script>${PLAYER_JS.replace(/<\/script/gi, '<\\/script')}</script>
</body>
</html>
`;
}
