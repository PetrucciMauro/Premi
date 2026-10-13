/*
 * Name : Giovanni Venturelli
 * Package : Tutorial
 * Description:
 *   Passi del tutorial dell'editor: si crea un frame, gli si dà un nome, lo si mette nel
 *   percorso, gli si aggiunge un testo e si scoprono gli altri comandi (transizioni comprese). Gli elementi creati durante il
 *   tutorial vengono ricordati, così i passi successivi parlano proprio di loro.
 */
import { SlideElement, TextElement, findElement } from '../model/presentation';
import { TourStep } from '../tutorial/tour';
import { EditorStore } from './editor-store';

export interface TutorialContext {
  store: EditorStore;
  /** il pannello dei percorsi è aperto */
  panelOpen: () => boolean;
}

export function editorTutorial({ store, panelOpen }: TutorialContext): TourStep[] {
  let frameId: number | null = null;
  let textId: number | null = null;
  let known = new Set<number>();
  let startPosition = '';

  const element = (id: number | null): SlideElement | undefined =>
    id === null ? undefined : findElement(store.proper(), id);
  const position = (el: SlideElement | undefined) => (el ? `${el.xIndex},${el.yIndex}` : '');
  const ids = (list: SlideElement[]) => new Set(list.map((el) => el.id));
  /** elemento della lista creato dopo l'inizio del passo */
  const created = (list: SlideElement[]) => list.filter((el) => !known.has(el.id)).at(-1);

  /** il frame del tutorial: quello creato o, se il passo è stato saltato, quello selezionato o il primo */
  const frame = () => {
    if (!element(frameId)) {
      const selected = store.selected();
      frameId = selected?.type === 'frame' ? selected.id : (store.proper().frames[0]?.id ?? null);
    }
    return element(frameId);
  };
  const text = () => {
    if (!element(textId)) {
      const selected = store.selected();
      textId = selected?.type === 'text' ? selected.id : (store.proper().texts.at(-1)?.id ?? null);
    }
    return element(textId) as TextElement | undefined;
  };
  const selectFrame = () => store.select(frame()?.id ?? null);
  const selectText = () => store.select(text()?.id ?? null);

  return [
    {
      title: 'Benvenuto in Premi!',
      text:
        'In pochi passi imparerai a creare una presentazione. In Premi non ci sono diapositive: c\'è una grande ' +
        '<b>tela</b> su cui disponi testi e immagini, e dei <b>frame</b> che fanno da inquadrature. ' +
        'In presentazione la telecamera vola da un frame all\'altro.<br><br>' +
        'Ogni modifica si può annullare: sperimenta pure.',
    },
    {
      title: 'La tela',
      target: 'canvas',
      text:
        'Questa è la tela. Con la <b>rotella del mouse</b> ti avvicini o ti allontani dal punto sotto il puntatore; ' +
        'con un <b>doppio clic</b> su un elemento lo inquadri. Doppio clic su un\'area vuota (o <kbd>Esc</kbd>) per ' +
        'tornare alla vista d\'insieme. Puoi anche trascinare qui immagini e video dal computer.',
    },
    {
      title: 'Lo sfondo',
      target: 'background',
      text: 'Da qui scegli il colore o l\'immagine di sfondo dell\'intera presentazione.',
    },
    {
      title: 'Il primo frame',
      target: 'insert',
      text:
        'Un frame è un\'inquadratura: in presentazione la telecamera lo mostra a tutto schermo. ' +
        'Può avere un colore o un\'immagine di sfondo.',
      task: 'Clicca «Inserisci» e scegli «Frame».',
      enter: () => (known = ids(store.proper().frames)),
      done: () => {
        const added = created(store.proper().frames);
        if (added) frameId = added.id;
        return !!added;
      },
    },
    {
      title: 'Sposta e ridimensiona',
      target: 'canvas',
      text:
        'Il frame è selezionato (bordo viola). Trascinalo per spostarlo; il quadratino nell\'angolo in basso a ' +
        'destra serve a ridimensionarlo. Le frecce della tastiera lo spostano di un pixel (con <kbd>Maiusc</kbd> di dieci).',
      task: 'Trascina il frame in un altro punto della tela.',
      enter: () => {
        selectFrame();
        startPosition = position(frame());
      },
      done: () => !!frame() && position(frame()) !== startPosition,
    },
    {
      title: 'La barra dell\'elemento',
      target: 'context-bar',
      text:
        'Quando selezioni un elemento compare questa barra con i suoi comandi: per un frame lo sfondo, ' +
        'il blocco delle proporzioni e l\'aggiunta al percorso.',
      enter: selectFrame,
    },
    {
      title: 'Dai un nome',
      target: 'name',
      text:
        'Ogni frame e ogni elemento può avere un <b>nome</b>: lo ritrovi nel percorso, nell\'elenco dei frame e ' +
        'nel menu della presentazione, al posto di «Frame 3». <kbd>Invio</kbd> conferma, <kbd>Esc</kbd> annulla; ' +
        'cancellandolo si torna al nome automatico.',
      task: 'Scrivi un nome per il frame e premi Invio.',
      enter: selectFrame,
      done: () => !!frame()?.name,
    },
    {
      title: 'Il percorso',
      target: 'add-path',
      text:
        'Il <b>percorso</b> è l\'ordine in cui la presentazione mostra i frame. Un frame fuori dal percorso resta ' +
        'sulla tela ma la telecamera non ci passa.',
      task: 'Clicca «Aggiungi al percorso».',
      enter: selectFrame,
      done: () => !!frame() && store.mainPath().includes(frame()!.id),
    },
    {
      title: 'Un testo nel frame',
      target: 'insert',
      text:
        'Con un frame selezionato, gli elementi che inserisci vengono <b>associati</b> al frame: lo seguono quando ' +
        'lo sposti, lo ruoti o lo ridimensioni.',
      task: 'Clicca «Inserisci» e scegli «Testo».',
      enter: () => {
        selectFrame();
        known = ids(store.proper().texts);
      },
      done: () => {
        const added = created(store.proper().texts);
        if (added) textId = added.id;
        return !!added;
      },
    },
    {
      title: 'Scrivi',
      target: () => (text() ? `[data-element-id="${text()!.id}"]` : null),
      text:
        'Scrivi direttamente nella casella. Per modificare un testo in seguito fai doppio clic su di esso; ' +
        'font, dimensione e colore sono nella barra in alto.',
      task: 'Scrivi un titolo, poi clicca su un\'area vuota per confermare.',
      done: () => !!text()?.content.trim(),
    },
    {
      title: 'Posiziona con un clic',
      target: 'place',
      text:
        'Questo menu porta l\'elemento tutto a sinistra, a destra, in alto, in basso o al centro del suo ' +
        'contenitore: il frame a cui è associato o, se non lo è, la tela.',
      // i testi nuovi sono già al centro del frame: si chiede di portarlo in alto
      task: 'Apri il menu e scegli «In alto».',
      enter: selectText,
      done: () => {
        const t = text();
        if (!t) return false;
        if (t.anchor) return Math.abs(t.anchor.y - t.anchor.height / 2) < 0.005;
        return Math.abs(t.yIndex) < 1;
      },
    },
    {
      title: 'Associazione ai frame',
      target: 'anchor',
      text:
        'Questo pulsante mostra a quale frame è associato l\'elemento: da qui puoi associarlo a un altro frame ' +
        'o separarlo e lasciarlo libero sulla tela.',
      enter: selectText,
    },
    {
      title: 'Rotazione e livelli',
      target: 'arrange',
      text:
        'Ruota l\'elemento, portalo davanti o dietro agli altri, oppure eliminalo (anche con <kbd>Canc</kbd>). ' +
        'I frame si possono anche inclinare in 3D dal menu di rotazione.',
      enter: selectText,
    },
    {
      title: 'Più elementi insieme',
      target: 'canvas',
      text:
        'Tieni premuto <kbd>Maiusc</kbd> o <kbd>Ctrl</kbd> e clicca più elementi per selezionarli insieme ' +
        '(devono stare nello stesso frame, o tutti liberi sulla tela): potrai spostarli, allinearli e distribuirli ' +
        'con un clic. <kbd>Ctrl</kbd>+<kbd>A</kbd> li seleziona tutti.<br><br>' +
        'Mentre trascini compaiono delle <b>guide</b> rosa quando un elemento è allineato a un altro ' +
        '(tieni premuto <kbd>Alt</kbd> per non agganciarti).',
    },
    {
      title: 'Percorsi e frame',
      target: 'panel',
      text:
        'Nel pannello vedi l\'ordine del percorso (trascina le tappe per cambiarlo), i <b>sottopercorsi</b> che partono ' +
        'al clic su un elemento e l\'elenco dei frame con i loro elementi.',
      task: 'Apri il pannello «Percorsi e frame».',
      done: panelOpen,
    },
    {
      title: 'Le transizioni',
      // il primo collegamento del percorso, se ce n'è già uno
      target: () => (document.querySelector('.transition-link') ? '.transition-link' : 'panel'),
      text:
        'Tra una tappa e la successiva c\'è la <b>transizione</b>: come la telecamera va da un frame all\'altro ' +
        '(volo, diretto, dissolvenza o stacco, con durata, andamento, giri e partenza automatica). Cliccala per ' +
        'modificarla e vederne l\'anteprima; tornando indietro si rivede al contrario.<br><br>' +
        'Le transizioni seguono il percorso: quando sposti, aggiungi o togli un frame, quelle che lo collegavano ' +
        'vengono eliminate e al loro posto ne nascono di nuove, con le impostazioni predefinite. Lo stesso vale ' +
        'nei sottopercorsi, che hanno anche una transizione d\'ingresso e una di ritorno.',
    },
    {
      title: 'Annulla e ripristina',
      target: 'undo',
      text:
        'Hai sbagliato? <kbd>Ctrl</kbd>+<kbd>Z</kbd> annulla, <kbd>Ctrl</kbd>+<kbd>Y</kbd> ripristina. ' +
        'Passando sul pulsante vedi quale modifica verrà annullata.',
    },
    {
      title: 'Salvataggio',
      target: 'save',
      text:
        'Le modifiche vengono salvate da sole ogni 30 secondi e quando esci; per salvare subito premi ' +
        '<kbd>Ctrl</kbd>+<kbd>S</kbd>. In alto a sinistra vedi se ci sono modifiche non salvate.',
    },
    {
      title: 'Presenta!',
      target: 'present',
      text:
        'Avvia la presentazione. Si avanza con le frecce, <kbd>Tab</kbd> o un clic sul bordo destro; <kbd>Spazio</kbd> ' +
        'salta al prossimo frame con bookmark ed <kbd>Esc</kbd> apre il menu.<br><br>' +
        'Hai finito! Puoi rivedere il tutorial quando vuoi dal pulsante <b>?</b> qui accanto.',
    },
  ];
}
