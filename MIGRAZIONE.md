# Migrazione ad Angular 22

Questo documento riassume tutte le modifiche introdotte con la migrazione di Premi
da AngularJS 1.3 ad Angular 22 (branch `upgrade/angular-22`, commit `1f535edf`).

Il frontend era scritto in AngularJS 1.3 (2014), per cui non esisteva un percorso di
aggiornamento automatico: è stato **riscritto da zero** in Angular 22. Anche il server
Node/Express è stato aggiornato, mantenendo le stesse API REST e la compatibilità con i
dati già salvati su MongoDB.

---

## 1. Nuova struttura del progetto

| Prima | Dopo |
|---|---|
| Tutto nella radice: `index.html`, `scripts/`, `css/`, `lib/`, `public_html/`, `private_html/`, `premi_Server.js`, `source/`, `serverRelation/` | `client/` (Angular 22) e `server/` (Express 5) |
| `node_server/`: copia duplicata e più vecchia del server | Rimossa |
| `files/`: file caricati dagli utenti | Spostati in `server/files/` |
| `assets/`, `favicon.ico` | Spostati in `client/public/` |
| `bower.json`, `bower_components/` | Rimossi: tutte le dipendenze arrivano da npm |
| `test/` (Karma), `testServer/`, `testServerRelation/`, `coverage/` | Sostituiti da `client/src/**/*.spec.ts` (Vitest) e `server/test/` (node:test) |
| `.travis.yml` (Node 0.12) | `.github/workflows/ci.yml` (GitHub Actions, Node 24) |
| `.jshintrc`, `.coveralls.yml`, `.bowerrc`, `manifest.appcache`, `jquery.js`, `config.js`, `mongoConfig.js` | Rimossi |

La radice contiene ora solo un `package.json` con gli script che orchestrano client e server:

| Script | Cosa fa |
|---|---|
| `npm install` | Installa le dipendenze di client e server |
| `npm run build` | Compila il client in `client/dist` |
| `npm start` | Avvia il server su http://localhost:8081 (serve anche il client compilato) |
| `npm run start:memory` | Avvia il server con un MongoDB in memoria (per provare senza installare MongoDB) |
| `npm run dev:client` / `npm run dev:server` | Sviluppo con ricaricamento automatico |
| `npm test` | Test del server e del client |

---

## 2. Dipendenze sostituite

### Frontend

| Prima | Dopo | Motivo |
|---|---|---|
| AngularJS 1.3 (`angular`, `angular-route`, `angular-resource`, `angular-animate`, `angular-aria`) | Angular 22.2 (`@angular/core`, `router`, `common/http`, `forms`) | AngularJS non è più supportato da gennaio 2022 |
| `angular-material` 0.10 | Angular Material 22 + Angular CDK | Libreria abbandonata |
| `ngStorage` | `localStorage` diretto in `AuthService` | Non più necessario |
| `angular-jwt` | Interceptor HTTP funzionale (`auth.interceptor.ts`) | Integrato in Angular |
| jQuery 2.1 + jQuery UI (draggable, resizable, sortable, droppable) | Pointer events nativi + `@angular/cdk/drag-drop` | Manipolazione del DOM incompatibile con Angular |
| `jquery-mousewheel`, `jscolor` | `<input type="color">` nativo | Non più necessari |
| impress.js 0.5.3 (copia modificata in `lib/`) | Player Angular (`player/player.ts`) | Fork non manutenibile, listener globali mai rimossi |
| CryptoJS (`lib/sha1.js`) | Web Crypto API (`crypto.subtle.digest`) | Nativo nel browser; stesso risultato, quindi le password salvate restano valide |
| Application Cache (`manifest.appcache`) | `@angular/service-worker` + IndexedDB | AppCache è stata rimossa da tutti i browser |
| Bower | npm | Bower è deprecato |
| Karma + PhantomJS + Jasmine | Vitest (runner predefinito di Angular 22) | PhantomJS e Karma sono abbandonati |

### Backend

| Prima | Dopo |
|---|---|
| `express` 4.13 | `express` 5.2 |
| `multer` 0.1 | `multer` 2.4 (nuova API `diskStorage`) |
| `jsonwebtoken` 5 (`expiresInMinutes`) | `jsonwebtoken` 9 (`expiresIn: '24h'`) |
| `mongodb` "latest" (API a callback) | `mongodb` 7.7 (async/await) |
| `morgan` 1.6 | `morgan` 1.12 |
| `body-parser` | `express.json()` integrato |
| `image-size` | Rimosso: l'endpoint `/sizeImage` non era usato dal client |
| `mongoose`, `fs`, `xmlhttprequest`, `serve-static`, `rimraf`, `statuses`, `unpipe`, `binary-extensions`, `http-server`, `nodemon`, `requirejs`, `proxyquireify`, `shelljs`, `istanbul`, `coveralls`, `jshint`, `tmp`, `phantomjs`, `bower`, `karma-*` | Rimossi: dichiarati ma inutilizzati, oppure sostituiti |
| — | `mongodb-memory-server`, `supertest` (solo per test e sviluppo) |

### Requisiti

- **Node.js**: da 0.12 a `^22.22.3 || ^24.15.0 || >=26.0.0` (requisito di Angular CLI 22).
- **TypeScript**: 6.0, in modalità `strict` con `strictTemplates`.
- `npm audit`: **0 vulnerabilità** sia nel client sia nel server.

---

## 3. Client Angular 22

Applicazione con componenti standalone, signals, change detection `OnPush`, senza zone.js,
con caricamento lazy delle pagine.

### File principali

| File | Sostituisce | Contenuto |
|---|---|---|
| `app.ts`, `app.html` | `HeaderController`, header di `index.html` | Intestazione con saluto e collegamenti; nascosta nel player |
| `app.routes.ts` | `$routeProvider` in `scripts/app.js` | Rotte con guard |
| `app.config.ts` | `premiApp.config` | Router, HttpClient, icone, gestore errori, service worker, locale italiano |
| `core/auth.service.ts` | Servizio `Main`, `serverRelation/Authentication.js`, `Registration.js` | Login, registrazione, logout, cambio password |
| `core/auth.interceptor.ts` | `$httpProvider.interceptors` | Aggiunge il token e porta al login su 401/403 |
| `core/auth.guard.ts` | Controllo `isLogin` su `$routeChangeStart` | `authGuard` e `guestGuard` |
| `core/crypto.ts` | `Utils.encrypt`, `Utils.decodeToken` | SHA-1 e decodifica del JWT |
| `core/presentation-api.service.ts` | `serverRelation/MongoRelation.js`, `FileServerRelation.js`, servizio `Upload` | Chiamate REST asincrone |
| `core/offline-store.service.ts` | `translatorManifest.js`, `homeofflinecontroller.js` | Presentazioni offline in IndexedDB |
| `core/notify.service.ts` | `alert()` ed errori lanciati e mai mostrati | Messaggi con `MatSnackBar` e `ErrorHandler` globale |
| `core/icons.ts` | `$mdIconProvider` | Registrazione delle icone SVG esistenti |
| `model/presentation.ts` | `slideshowelement.js` | Tipi TypeScript, normalizzazione dei dati, utility |
| `editor/editor-store.ts` | `inserteditremove.js`, `command.js`, `serverRelation/Loader.js` | Stato dell'editor, annulla/ripristina, salvataggio |
| `editor/editor.ts/.html/.scss` | `editController.js`, `viewscripts.js`, `edit.html`, `FileUp.js` | Pagina di modifica |
| `shared/slide-canvas.ts` | Rendering con `createElement` in `viewscripts.js` e stringhe HTML in `translatorImpress.js` | Disegno della tela, comune a editor e player |
| `shared/view-transform.ts` | Calcoli di zoom in `viewscripts.js`, coordinate "7440/3600" di `translatorImpress.js` | Matrice "telecamera" che inquadra un frame |
| `player/player.ts` | `executionController.js`, `translatorImpress.js`, `lib/impress.js` | Esecuzione della presentazione |
| `pages/access/` | `AuthenticationController`, `login.html`, `registrazione.html` | Login e registrazione |
| `pages/home/` | `homeController.js`, `home.html`, `NameTemplate.html`, `newSlideShowTemplate.html` | Elenco presentazioni e dialoghi |
| `pages/profile/profile.ts` | `profileController.js`, `profile.html` | Cambio password |
| `pages/offline/offline-list.ts` | `homeoffline.html`, `offlineexecution.html` | Elenco delle presentazioni offline |

### Rotte

| Rotta | Pagina | Accesso |
|---|---|---|
| `/login`, `/registrazione` | Login e registrazione | Solo utenti non autenticati |
| `/private/home` | Elenco presentazioni | Autenticati |
| `/private/profile` | Profilo | Autenticati |
| `/private/edit/:title` | Editor | Autenticati |
| `/private/execution/:title` | Player a schermo intero | Autenticati |
| `/offline`, `/offline/:title` | Presentazioni salvate offline | Pubblico |

Prima la presentazione da aprire passava per `SharedData` e `$localStorage.idMyPresentation`;
ora il titolo è nell'URL, quindi le pagine si possono ricaricare e aggiungere ai preferiti.
Le rotte non usano più `#/`.

### Editor

Architettura nuova: la vista è derivata dallo stato tramite signals, invece di essere
modificata a mano con jQuery e tenuta in sincronia con il modello.

- **Stato immutabile**: ogni modifica crea un nuovo stato. Annulla/ripristina conservano lo
  stato prima e dopo il comando, al posto delle oltre 25 classi `concrete*Command` di
  `command.js`. Il tooltip mostra la descrizione del comando ("Annulla sposta elemento" e simili).
- **Comandi accorpati**: i passi consecutivi dello slider di rotazione, della dimensione del
  font e delle frecce da tastiera diventano un'unica voce di annullamento.
- **Salvataggio per differenza**: al posto del `Loader` con le code di insert, update e delete,
  il salvataggio confronta lo stato attuale con l'ultimo salvato e invia solo le eliminazioni,
  gli inserimenti, le modifiche, il percorso e lo sfondo cambiati. Se una richiesta fallisce,
  il salvataggio successivo invia solo ciò che manca, senza duplicare gli inserimenti.
- Salvataggio automatico ogni 30 secondi e all'uscita dalla pagina; avviso del browser se si
  chiude con modifiche non salvate; indicatore "Salvataggio… / Modifiche non salvate".
- **Tela a dimensione logica**: le coordinate restano quelle salvate (`background.width` e
  `background.height`) e la tela viene scalata per adattarsi alla finestra. Prima la tela
  dipendeva da `screen.width` e all'apertura su uno schermo diverso gli elementi venivano
  ridimensionati e salvati di nuovo.

Funzionalità mantenute:

- inserimento di frame, testi, immagini, video e audio (anche più file insieme);
- trascinamento di file dal desktop sulla tela;
- spostamento con il mouse: spostando un frame si spostano anche gli elementi contenuti al suo interno;
- spostamento con le frecce (Shift per passi di 10 px);
- ridimensionamento con la maniglia, con proporzioni bloccate tranne che per i testi;
- rotazione con lo slider;
- porta avanti / porta dietro;
- eliminazione, anche con il tasto Canc;
- testi: colore, dimensione e font (stessa lista di 13 font);
- sfondo della presentazione e dei frame: colore, immagine, rimozione;
- percorso principale: aggiunta, rimozione e riordino trascinando nel pannello laterale;
  passando col mouse su una voce il frame viene evidenziato, cliccandola il frame viene inquadrato;
- bookmark sui frame del percorso;
- play/pausa di audio e video;
- zoom su un elemento con doppio clic, zoom out con il pulsante o con Esc;
- "Esegui": salva e apre il player.

Novità:

- scorciatoie Ctrl+Z (annulla), Ctrl+Y / Ctrl+Shift+Z (ripristina), Ctrl+S (salva), Esc;
- i testi si selezionano e trascinano con il primo clic e si modificano con il secondo
  (prima l'area per trascinarli era larga pochi pixel);
- barra di avanzamento durante il caricamento dei file;
- eliminando un frame lo si toglie anche dal percorso, nello stesso comando annullabile;
- togliendo un frame dal percorso se ne azzera il bookmark.

### Player (al posto di impress.js)

- Stessa tela dell'editor, quindi la presentazione appare esattamente come in modifica:
  non servono più le conversioni di coordinate di `translatorImpress.js`.
- Sequenza: vista d'insieme, poi i frame del percorso principale, poi di nuovo la vista
  d'insieme (come la versione modificata di impress.js).
- Ogni frame viene inquadrato, raddrizzato se ruotato e animato con una transizione CSS.
- Tasti: → ↓ PagGiù Tab avanti; ← ↑ PagSu indietro; Spazio al bookmark successivo; Esc per il menu.
- Clic su un frame per inquadrarlo; tocco sul bordo sinistro o destro dello schermo per navigare.
- Menu con Home, Edit, vista d'insieme ed elenco dei frame (★ sui bookmark).
- Audio e video con i controlli del browser.

### Offline

- "Salva offline" nella home scarica la presentazione e i suoi file multimediali in IndexedDB.
  Prima veniva salvato in `localStorage` un HTML generato, che era limitato a circa 5 MB e non
  includeva i media.
- "Aggiorna offline" e "Rimuovi offline" per le presentazioni già salvate.
- `/offline` elenca le presentazioni salvate; il player le riproduce usando URL locali (`blob:`).
- Il service worker di Angular (attivo solo nella build di produzione) mette in cache l'app,
  così le presentazioni offline si aprono anche senza connessione.

### Sessione

- Prima nel `localStorage` venivano salvati username e hash della password, per rifare il login
  a ogni refresh. Ora si conserva solo il token JWT (durata 24 ore), controllandone la scadenza.
- Le password continuano a essere inviate come SHA-1 esadecimale, quindi gli account esistenti
  funzionano senza modifiche al database.

### Grafica

- Tema Material 3 con palette blu e giallo (simile all'indigo/yellow della versione precedente).
- Le icone SVG originali di `assets/svg` sono state mantenute, tranne quattro non usate
  (`google_plus`, `mail`, `phone`, `twitter`).
- Home a griglia di card con l'anteprima dello sfondo; dialoghi Material per creazione,
  rinomina e conferma dell'eliminazione.
- Locale italiano per date e numeri.

---

## 4. Server

### Struttura

```
server/
├── src/
│   ├── server.js            avvio
│   ├── app.js               configurazione di Express
│   ├── config.js            variabili d'ambiente
│   ├── db.js                connessione unica a MongoDB
│   ├── auth.js              middleware JWT
│   └── routes/
│       ├── account.js       authenticate, register, changepassword
│       ├── files.js         upload, elenco, rinomina, eliminazione, download
│       └── presentations.js presentazioni ed elementi
├── scripts/dev-memory.js    avvio con MongoDB in memoria
├── test/api.test.js         test di integrazione
└── files/                   file caricati dagli utenti
```

I 20 file di `source/` (uno per endpoint, con callback annidate e codice duplicato) sono
confluiti in tre moduli di rotte con async/await.

### Configurazione

Prima il segreto JWT e l'indirizzo del database erano scritti in `config.js`. Ora si usano
variabili d'ambiente:

| Variabile | Predefinito |
|---|---|
| `PORT` | `8081` |
| `MONGODB_URI` | `mongodb://localhost:27017/premi` |
| `JWT_SECRET` | `griever` (il vecchio segreto; in produzione compare un avviso) |
| `FILES_DIR` | `server/files` |
| `CLIENT_DIR` | `client/dist/client/browser` |

### API

Gli endpoint sono gli stessi della versione precedente. Le differenze:

| Endpoint | Modifica |
|---|---|
| Tutti | Una sola connessione MongoDB condivisa (prima ogni richiesta apriva e chiudeva una connessione) |
| `/private/api/...` | Il middleware del token protegge solo `/private/api`, così le pagine `/private/...` del client si possono ricaricare |
| `GET /account/authenticate` | Credenziali errate: 401 (prima 400) |
| `POST /account/register` | Utente già esistente: 409 (prima 304 senza corpo, che faceva fallire il client). Username validato (lettere, numeri, `.`, `_`, `-`) perché diventa un nome di cartella e di collezione |
| `POST /account/changepassword` | Credenziali errate: 401; nuova password obbligatoria |
| `POST /private/api/presentations/new/:name` | Titolo già esistente: 409 |
| `POST /private/api/presentations/new/:name/:copyOf` | Funzionante (prima il client concatenava i due titoli senza `/`) |
| `POST .../:name/rename/:newName` | Rifiuta un titolo già esistente (409) |
| `PUT .../element`, `DELETE .../delete/:type/:id` | Accettano id sia numerici sia stringa: la vecchia versione li salvava in entrambi i formati e alcune modifiche o eliminazioni fallivano |
| `GET /private/api/presentations` | Restituisce solo i metadati (prima leggeva intere le presentazioni) |
| `POST /private/api/files/:type/:name` | Risponde 201 con il nome del file salvato |
| `GET /private/api/files/sizeImage/:name` | Rimosso (non usato; inoltre invertiva larghezza e altezza) |
| Rotte sconosciute | 404 in JSON |
| Altre rotte GET | Servono `index.html` del client (routing lato client) |

### Sicurezza

- Prima `express.static('./')` esponeva l'intero repository, compreso `config.js` con il
  segreto JWT. Ora viene servita solo la build del client.
- I nomi di file e utenti presi dall'URL vengono ridotti a `path.basename`, per bloccare il
  path traversal (`../`) in upload, download, rinomina ed eliminazione.
- Limite di 200 MB sui file caricati e di 1 MB sui corpi JSON.
- Rimosso il codice di prova finito in fondo a `premi_Server.js` (comandi della shell di
  Mongo che rendevano il file non valido).

---

## 5. Test

| Progetto | Strumento | Test |
|---|---|---|
| server | `node:test` + `supertest` + `mongodb-memory-server` | 6 test di integrazione: account, rotte protette, ciclo di vita di una presentazione, id stringa della vecchia versione, file (con controllo del path traversal), fallback del client |
| client | Vitest | 14 test: normalizzazione dei dati della vecchia versione e utility (`presentation.spec.ts`), annulla/ripristina, livelli, salvataggio per differenza e ripresa dopo un errore (`editor-store.spec.ts`), login, logout, cambio password e compatibilità SHA-1 (`auth.service.spec.ts`) |

Verificato manualmente nel browser: registrazione, creazione, modifica (inserimento,
spostamento, ridimensionamento, rotazione, eliminazione, annulla), caricamento di
un'immagine, percorso principale e bookmark, salvataggio, esecuzione, menu del player,
rinomina, salvataggio e riproduzione offline. Login e cambio password non si sono potuti
provare a mano perché un'estensione del browser bloccava l'automazione sui campi password;
sono coperti dai test automatici.

---

## 6. Compatibilità con i dati esistenti

- **Formato MongoDB invariato**: collezione `users`, una collezione `presentations<utente>`,
  campi `meta` e `proper`.
- **Normalizzazione in lettura**: id convertiti in numeri, campi mancanti valorizzati,
  indirizzi salvati come `url("...")` ripuliti.
- **File** sempre in `files/<utente>/<image|audio|video>/` e referenziati come `files/...`.
- **Password**: stesso hash SHA-1, nessuna migrazione necessaria.
- **Sfondo**: le presentazioni nuove, senza dimensioni dello sfondo, le ricevono al primo salvataggio.
- **Percorsi di scelta** (`paths.choices`): erano implementati solo a metà e senza interfaccia
  funzionante. I dati vengono conservati (e ripuliti quando si elimina un frame), ma non c'è
  un editor per modificarli.

---

## 7. Note operative

- Prima di usare il progetto serve Node 24: `nvm use 24.21.0`. La versione 24.21.0 è stata
  installata con nvm, ma quella predefinita del sistema non è stata cambiata.
- In produzione impostare `JWT_SECRET`.
- Dopo l'aggiornamento gli utenti devono rifare il login una volta, perché la sessione ora è
  basata sul token.
- Per provare senza MongoDB: `npm install`, `npm run build`, `npm run start:memory`, poi aprire
  http://localhost:8081 (i dati si perdono alla chiusura).

---

## 8. Passaggio all'app desktop (Electron + SQLite)

Dopo la migrazione ad Angular 22, Premi è diventata un'app desktop. Le sezioni precedenti
descrivono la versione web intermedia: dove sono in contrasto, vale questa.

**Perché.** Le immagini erano salvate in base64 dentro il documento MongoDB della presentazione,
che non può superare i 16 MB: le presentazioni con molte immagini non si potevano salvare.

| Prima (web) | Dopo (desktop) |
|---|---|
| Server Express pubblico con MongoDB | Server Express locale (su `127.0.0.1`) avviato dall'app Electron |
| Presentazione = un documento MongoDB con le immagini in base64 | SQLite (`node:sqlite`): una riga per presentazione e una per elemento |
| Immagini in base64, audio e video in `server/files/<utente>/` | Tutti i media come file in `media/`, nominati con l'impronta SHA-256 del contenuto |
| Account, login, JWT, profilo | Nessun account: un token casuale per sessione, aggiunto da Electron alle richieste |
| Sezione "Offline" (IndexedDB) e service worker | Rimossi: tutto è già sul computer |
| Limite di 8 MB per immagine e 16 MB per presentazione | Nessun limite (import fino a 2 GB) |

- **API**: le rotte delle presentazioni sono le stesse; `GET /private/api/presentations`
  restituisce anche lo sfondo (per le anteprime). I media si caricano con
  `POST /private/api/media` e si leggono da `/media/<nome>`; `/account` e `/files` non esistono più.
- **Import/export**: importando un JSON i media in base64 vengono salvati come file; l'export
  JSON ora incorpora anche audio e video, così il file si può importare in un'altra installazione.
- **Migrazione dei dati**: `npm run migrate:mongo` (vedi README).
- **Packaging**: `desktop/` con electron-builder (Windows nsis/portable, macOS dmg, Linux AppImage).
  `node:sqlite` è incluso in Electron 44 (Node 24): non ci sono moduli nativi da ricompilare.
