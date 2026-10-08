# Premi better than Prezi

Editor di presentazioni in stile Prezi: frame, testi, immagini, audio e video su una tela,
un percorso principale da seguire in esecuzione e bookmark per saltare tra i frame.

## Struttura

| Cartella  | Contenuto |
|-----------|-----------|
| `client/` | Applicazione Angular 22 (componenti standalone, signals, Angular Material) |
| `server/` | Server REST Node.js con Express 5 e MongoDB; in `server/files/` i file caricati dagli utenti |

## Requisiti

- Node.js 22.22.3+, 24.15+ oppure 26+
- MongoDB (per lo sviluppo si può usare `npm run start:memory`, che avvia un MongoDB in memoria)

## Installazione

```bash
npm install        # installa le dipendenze di client e server
npm run build      # compila il client in client/dist
npm start          # avvia il server su http://localhost:8081
```

Il server legge queste variabili d'ambiente:

| Variabile     | Predefinito                        |
|---------------|------------------------------------|
| `PORT`        | `8081`                             |
| `MONGODB_URI` | `mongodb://localhost:27017/premi`  |
| `JWT_SECRET`  | segreto di sviluppo: **da impostare in produzione** |
| `FILES_DIR`   | `server/files`                     |

## Sviluppo

```bash
npm run dev:server   # server con riavvio automatico (oppure npm run start:memory)
npm run dev:client   # ng serve su http://localhost:4200, con proxy verso il server
npm test             # test del server (node:test) e del client (Vitest)
```

## Uso offline

Dalla home, "Salva offline" conserva la presentazione e i suoi file nel browser (IndexedDB).
Le presentazioni salvate si trovano in `/offline` e funzionano anche senza connessione,
grazie al service worker di Angular attivo nella build di produzione.
