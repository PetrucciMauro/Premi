import { describe, expect, it } from 'vitest';
import { normalizePresentation } from '../app/model/presentation';
import { standaloneHtml } from './html';

describe('esportazione HTML', () => {
  const presentation = normalizePresentation({
    meta: { titolo: 'Prova <b>&</b> "virgolette"' },
    proper: { texts: [{ id: 1, content: '</script><script>alert(1)</script>' }], background: { id: 0 } },
  });
  const html = standaloneHtml(presentation, 'data:image/png;base64,AAAA');

  it('è una pagina completa con player e dati incorporati', () => {
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<title>Prova &lt;b&gt;&amp;&lt;/b&gt; &quot;virgolette&quot;</title>');
    expect(html).toMatch(/<style>.+<\/style>/s);
    // nessuna risorsa esterna
    expect(html).not.toMatch(/<(script|link)[^>]+(src|href)=/);
  });

  it('i testi della presentazione non possono chiudere il tag dei dati', () => {
    const data = /<script type="application\/json" id="premi-data">(.*?)<\/script>/s.exec(html)![1];
    expect(data).not.toContain('<');
    expect(JSON.parse(data).presentation.proper.texts[0].content).toBe('</script><script>alert(1)</script>');
    expect(JSON.parse(data).audioIcon).toBe('data:image/png;base64,AAAA');
  });
});
