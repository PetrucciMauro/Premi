/*
 * App desktop di Premi (Electron).
 * All'avvio parte il server locale (server/src/local.js) su 127.0.0.1, con il database
 * SQLite e i media nella cartella dei dati dell'utente; la finestra carica da lì l'app
 * Angular. Ogni richiesta della finestra al server riceve un token casuale generato a ogni
 * avvio, così gli altri programmi del computer non possono usare il server.
 */
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BrowserWindow, Menu, app, dialog, session, shell } from 'electron';

const here = path.dirname(fileURLToPath(import.meta.url));

// nell'app impacchettata server e client sono copiati in build/ (scripts/prepare.mjs);
// durante lo sviluppo si usano direttamente le cartelle del progetto
const serverDir = app.isPackaged ? path.join(here, 'build', 'server') : path.join(here, '..', 'server');
const clientDir = app.isPackaged ? path.join(here, 'build', 'client') : path.join(here, '..', 'client', 'dist', 'client', 'browser');

const dataDir = process.env.PREMI_DATA_DIR || path.join(app.getPath('userData'), 'dati');

let server;
let mainWindow;

if (!app.requestSingleInstanceLock()) app.quit();

app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
});

function menu() {
  const help = {
    label: 'Aiuto',
    submenu: [
      { label: 'Apri la cartella dei dati', click: () => shell.openPath(dataDir) },
      {
        label: 'Informazioni su Premi',
        click: () =>
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Premi',
            message: `Premi ${app.getVersion()}`,
            detail: `Le presentazioni e i file multimediali sono salvati in:\n${dataDir}`,
          }),
      },
    ],
  };
  const view = {
    label: 'Visualizza',
    submenu: [
      { role: 'togglefullscreen', label: 'Schermo intero' },
      { role: 'resetZoom', label: 'Dimensione reale' },
      { role: 'zoomIn', label: 'Ingrandisci' },
      { role: 'zoomOut', label: 'Riduci' },
      ...(app.isPackaged ? [] : [{ type: 'separator' }, { role: 'reload' }, { role: 'toggleDevTools' }]),
    ],
  };
  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : [{ label: 'File', submenu: [{ role: 'quit', label: 'Esci' }] }]),
    { role: 'editMenu', label: 'Modifica' },
    view,
    help,
  ];
  return Menu.buildFromTemplate(template);
}

async function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#131218',
    title: 'Premi',
    show: false,
    autoHideMenuBar: process.platform !== 'darwin',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => (mainWindow = null));

  // la finestra resta sull'app: i link esterni si aprono nel browser
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    if (/^https?:\/\//.test(target) && !target.startsWith(url)) shell.openExternal(target);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, target) => {
    if (!target.startsWith(url)) {
      event.preventDefault();
      if (/^https?:\/\//.test(target)) shell.openExternal(target);
    }
  });
  // F11 per lo schermo intero anche con la barra dei menu nascosta
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });

  await mainWindow.loadURL(url);
  if (process.env.PREMI_SMOKE_TEST) await smokeTest();
}

/**
 * Prova di funzionamento (PREMI_SMOKE_TEST=1): dalla finestra verifica che l'interfaccia sia
 * caricata, che le API rispondano (token aggiunto dalla sessione) e che i media si possano
 * caricare e rileggere; stampa l'esito ed esce.
 */
async function smokeTest() {
  const result = await mainWindow.webContents.executeJavaScript(`(async () => {
    for (let i = 0; i < 50 && !document.querySelector('app-home h1'); i++) await new Promise((r) => setTimeout(r, 100));
    const list = await fetch('/private/api/presentations');
    const body = new FormData();
    body.append('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"/>'], { type: 'image/svg+xml' }), 'prova.svg');
    const upload = await (await fetch('/private/api/media', { method: 'POST', body })).json();
    const media = await fetch('/' + upload.url);
    return { title: document.querySelector('app-home h1')?.textContent?.trim(), list: list.status, upload: upload.url, media: media.status };
  })()`);
  const ok = result.title && result.list === 200 && /^media\//.test(result.upload) && result.media === 200;
  console.log((ok ? 'SMOKE OK ' : 'SMOKE FALLITO ') + JSON.stringify(result));
  app.exit(ok ? 0 : 1);
}

app.whenReady().then(async () => {
  try {
    const token = randomBytes(32).toString('hex');
    const { startServer } = await import(pathToFileURL(path.join(serverDir, 'src', 'local.js')).href);
    server = await startServer({ dataDir, token, clientDir, logging: !app.isPackaged });

    // il token viene aggiunto a tutte le richieste verso il server locale (API e media)
    session.defaultSession.webRequest.onBeforeSendHeaders({ urls: [`${server.url}/*`] }, (details, callback) => {
      callback({ requestHeaders: { ...details.requestHeaders, Authorization: token } });
    });
    // nessun permesso (fotocamera, notifiche...) è necessario all'app
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) =>
      callback(permission === 'fullscreen' || permission === 'clipboard-sanitized-write'),
    );

    Menu.setApplicationMenu(menu());
    await createWindow(server.url);
  } catch (err) {
    dialog.showErrorBox('Premi non può partire', String(err?.stack ?? err));
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow && server) createWindow(server.url);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

let closing = false;
app.on('before-quit', async (event) => {
  if (closing || !server) return;
  // il database viene chiuso in modo pulito prima di uscire
  event.preventDefault();
  closing = true;
  await server.close().catch(() => undefined);
  app.quit();
});
