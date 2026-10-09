# Premi better than Prezi

Editor di presentazioni in stile Prezi: frame, testi, immagini, audio e video su una tela,
un percorso principale da seguire in esecuzione, sottopercorsi, bookmark, frame ruotati e in 3D.

Premi è un'**app desktop** (Electron) per Windows, macOS e Linux: le presentazioni sono salvate
sul computer, in un database SQLite, e i file multimediali in una cartella accanto, senza limiti
di dimensione. Le presentazioni si possono esportare in JSON (da reimportare) o in una pagina
HTML autonoma che si apre in qualsiasi browser.

## Struttura

| Cartella   | Contenuto |
|------------|-----------|
| `client/`  | Interfaccia Angular 22 (componenti standalone, signals, Angular Material) e player autonomo per l'export HTML (`client/src/standalone`) |
| `server/`  | Server locale Express 5: API delle presentazioni, archivio SQLite (`node:sqlite`) e file multimediali |
| `desktop/` | App Electron: avvia il server locale e mostra l'interfaccia; configurazione di electron-builder |
| `esempi/`  | Presentazioni di esempio da importare (JSON) |

## Come funziona

All'avvio l'app Electron fa partire il server locale su `127.0.0.1`, su una porta libera, e la
finestra carica da lì l'interfaccia. A ogni avvio viene generato un token casuale che Electron
aggiunge a tutte le richieste della finestra: gli altri programmi del computer non possono usare
il server.

I dati sono nella cartella dell'utente (menu **Aiuto → Apri la cartella dei dati**):

| Sistema | Cartella |
|---------|----------|
| Windows | `%APPDATA%\Premi\dati` |
| macOS   | `~/Library/Application Support/Premi/dati` |
| Linux   | `~/.config/Premi/dati` |

- `premi.db`: database SQLite (presentazioni ed elementi);
- `media/`: immagini, audio e video. Ogni file prende il nome dall'impronta del contenuto, quindi
  lo stesso file usato più volte occupa spazio una volta sola; all'avvio vengono eliminati i file
  che nessuna presentazione usa più.

## Requisiti

- Node.js 22.22.3+, 24.15+ oppure 26+ (solo per lo sviluppo: l'app installata include tutto)

## Uso

```bash
npm install            # dipendenze di client, server e app desktop (scarica Electron)
npm start              # compila il client e apre l'app desktop
npm run dist:desktop   # crea l'installer per il sistema corrente in desktop/dist
npm run pack:desktop   # come sopra, ma solo la cartella dell'app (desktop/dist/<sistema>-unpacked)
```

Gli installer: Windows `nsis` (installazione guidata) e `portable`, macOS `dmg`, Linux `AppImage`.
Ogni sistema va impacchettato sul sistema stesso (o in CI).

## Sviluppo

```bash
npm run dev:server   # server locale con riavvio automatico su http://localhost:8081 (dati in server/data)
npm run dev:client   # ng serve su http://localhost:4200, con proxy verso il server
npm test             # test del server (node:test) e del client (Vitest)
```

In sviluppo il server non richiede il token. Per provare l'app desktop con le modifiche:
`npm start` (ricompila il client) oppure `npm start --prefix desktop` (usa la build esistente).

Variabili d'ambiente utili:

| Variabile          | Effetto |
|--------------------|---------|
| `PREMI_DATA_DIR`   | cartella dei dati (app desktop e server di sviluppo) |
| `PORT`             | porta del server di sviluppo (predefinita `8081`) |
| `PREMI_SMOKE_TEST` | con `1`, l'app desktop verifica interfaccia, API e media, stampa l'esito ed esce |

## Dalla versione web con MongoDB

Le presentazioni della versione precedente si importano con

```bash
npm run migrate:mongo -- --uri mongodb://localhost:27017/premi --files server/files --data "<cartella dei dati>"
```

con l'app chiusa. Le presentazioni di tutti gli utenti finiscono nello stesso archivio (a titoli
uguali si aggiunge il nome dell'utente); le immagini in base64 e i file di `server/files` diventano
file dell'archivio. In alternativa si può esportare ogni presentazione in JSON dalla vecchia
versione e importarla nell'app.
