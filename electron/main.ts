import { exec } from 'node:child_process';
import { app, BrowserWindow, dialog, Event, ipcMain } from 'electron';
import HttpServer from './server';
import dotenv from 'dotenv';
import configService from './data/ConfigService';
import AppConfig from './data/model/AppConfig';
import LogMsg from './data/model/LogMsg';

dotenv.config();

const PORT = parseInt(process.env.SERVER_PORT || '9001');
const USE_CHROME_BROWSER = (/^true$/i).test(process.env.USE_CHROME_BROWSER || 'false');
const CLIENT_URL = process.env.CLIENT_URL || "https://docs.fedoraproject.org";

let mainWindow: BrowserWindow | null;
let httpServer: HttpServer | null;
let webView: BrowserWindow | null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const IpcEvents = {
    APP_INFO: "app:info",
    LOGS: "app:logs",
    ...HttpServer.Events
};

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()

function createWindow () {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 800,
    height: 600,
    backgroundColor: '#FFF',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('close', (e: Event) => {
    e.preventDefault()
    dialog.showMessageBox({
      title: 'Confirm',
      type: "warning",
      message: 'Are you sure you want to quit?',
      buttons: ['Yes', 'No'],
    }).then((confirm: any) => {
      console.log("Quit app confirm:", confirm.response);
      if (confirm.response === 0) { // Runs the following if 'Yes' is clicked
        // app?.showExitPrompt = false;
        mainWindow?.close();
        app.quit();
        process.exit();
      }
    });
  });
  // let index = 0;
  // setInterval(() => {logger.debug("test log " + index)}, 2000);
}

function saveConfigs(config: AppConfig) {
  configService.updateAppConfig(config);
}

async function openChromeTab(url: string) {
  try {
    if (!USE_CHROME_BROWSER) {
      if (!webView || webView.isDestroyed()) webView = new BrowserWindow({
        icon: "",
        title: "Web view",
        width: 800, height: 600,
      });
      // webView.setKiosk(true);
      webView.setFullScreen(true);
      webView.loadURL(url);
    } else {
      if (process.platform === 'win32') {
        exec(`start chrome ${url}`, (error: any, stdout: string, stderr: string) => {
          ipcSendMessage({
            event: IpcEvents.LOGS,
            data: new LogMsg(error ? LogMsg.Types.ERROR : LogMsg.Types.INFO, error ? stderr : stdout)
          });
        });
      } else {
        exec(`google-chrome ${url}`, (error: any, stdout: string, stderr: string) => {
          ipcSendMessage({
            event: IpcEvents.LOGS,
            data: new LogMsg(error ? LogMsg.Types.ERROR : LogMsg.Types.INFO, error ? stderr : stdout)
          });
        });
      }
    }
  } catch(err: any) {
    logger.error(err.message || err);
  }
}

function startServer(port: number) {
  httpServer = HttpServer.getInstance();
  httpServer?.start(port, () => {
    ipcSendMessage({event: IpcEvents.START, data: {
      isRunning: httpServer?.isRunning()
    }});
    openChromeTab(CLIENT_URL);
  });
  httpServer?.addListener(IpcEvents.POST, (data) => {
    logger.info("[REQUES] post data", data);
    openChromeTab('https://docs.fedoraproject.org/en-US/fedora/latest/');
  });
  httpServer?.addListener(IpcEvents.STOP, (data) => {
    logger.warn(`[HTTP] Event.${IpcEvents.STOP}`);
    ipcSendMessage({event: IpcEvents.STOP, data: {
      isRunning: httpServer?.isRunning()
    }});
  });
  httpServer?.addListener(IpcEvents.LOGS, (data) => {
    logger.info(`[HTTP] Event.${IpcEvents.LOGS}`);
    ipcSendMessage({event: IpcEvents.LOGS, data});
  });
}

function stopServer(callback?: Function) {
  httpServer?.stop(callback);
}

function ipcSendMessage(message: {event: string, data: any}) {
  mainWindow?.webContents.send("message", message);
}

function _log(type: string, message: string) {
  console.log(type, message);
  ipcSendMessage({ event: IpcEvents.LOGS, data: new LogMsg(type, message) });
}

const logger = {
  error: (...messages: Array<any>) => {
    _log(LogMsg.Types.ERROR, messages.map((msg) => JSON.stringify(msg)).join(" "));
  },
  warn: (...messages: Array<any>) => {
    _log(LogMsg.Types.WARN, messages.map((msg) => JSON.stringify(msg)).join(" "));
  },
  info: (...messages: Array<any>) => {
    _log(LogMsg.Types.INFO, messages.map((msg) => JSON.stringify(msg)).join(" "));
  },
  debug: (...messages: Array<any>) => {
    _log(LogMsg.Types.DEBUG, messages.map((msg) => JSON.stringify(msg)).join(" "));
  },
};

async function registerListeners () {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on('message', (evt, message) => {
    console.log("new message", message);
    
    let { event, data } = JSON.parse(message);
    // logger.info(`[IPC] Events.${event}:`, data);
    switch(event) {
      case 'ready': {
        // evt.sender.send("message", {isRunning: httpServer?.isRunning() || false});
        ipcSendMessage({ event: IpcEvents.APP_INFO, data: { isRunning: httpServer?.isRunning() || false } });
        // setInterval(() => logger.info("PING", new Date()), 5000);
        break;
      }
      case 'config': {
        saveConfigs(data);
        break;
      }
      case 'start': {
        startServer(PORT);
        break;
      }
      case 'stop': {
        stopServer(() => {
          /* ipcSendMessage({ event: IpcEvents.STOP, data: "stop server" }) */
          httpServer?.removeAllListeners();
        });
        break;
      }
      default: break;
    }
  });
}

app.on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

const uncaughtErrorHandler = (options: any, exitCode: number) => {
  logger.error("uncaughtErrorHandler", options, exitCode);
  try {
      if (options.cleanup) {
        webView?.close();
          logger.info('clean');
      }
  } catch(error: any) {
      logger.error("kill all child processes failed with error", error.message);
  } finally {
      if (exitCode || exitCode === 0) console.log(exitCode);
      if (options.exit) process.exit();
  }
}

// do something when app is closing
process.on('exit', uncaughtErrorHandler.bind(null, {cleanup: true}));
