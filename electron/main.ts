import { exec, ExecException } from 'node:child_process';
import { app, BrowserWindow, ipcMain } from 'electron';
import HttpServer from './server';
import dotenv from 'dotenv';
import configService from './data/ConfigService';
import AppConfig from './data/model/AppConfig';
import LogMsg from './data/model/LogMsg';

dotenv.config();

const PORT = parseInt(process.env.SERVER_PORT || '9001');

let mainWindow: BrowserWindow | null;
let httpServer: HttpServer | null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const IpcEvents = {
    APP_INFO: "app_info",
    LOGS: "logs",
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
    backgroundColor: '#191622',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  // let index = 0;
  // setInterval(() => {logger.debug("test log " + index)}, 2000);
}

function saveConfigs(config: AppConfig) {
  configService.updateAppConfig(config);
}

function openChromeTab(url: string) {
  if (process.platform === 'win32') {
    exec(`start chrome ${url}`, (error: any, stdout: string, stderr: string) => {
      ipcSendMessage({event: IpcEvents.LOGS, data: (error ? stderr : stdout)});
    });
  } else {
    exec(`google-chrome ${url}`, (error: any, stdout: string, stderr: string) => {
      ipcSendMessage({event: IpcEvents.LOGS, data: (error ? stderr : stdout)});
    });
  }
}

function startServer(port: number) {
  httpServer = HttpServer.getInstance();
  httpServer?.start(port, () => {
    ipcSendMessage(IpcEvents.START);
  });
  httpServer?.addListener(IpcEvents.POST, (data) => {
    logger.info("[REQUES] post data", data);
    openChromeTab('https://docs.fedoraproject.org/');
  });
  httpServer?.addListener(IpcEvents.STOP, (data) => {
    logger.warn(`[HTTP] Event.${IpcEvents.STOP}`);
    ipcSendMessage({event: IpcEvents.STOP});
  });
  httpServer?.addListener(IpcEvents.LOGS, (data) => {
    logger.info(`[HTTP] Event.${IpcEvents.LOGS}`);
    ipcSendMessage({event: IpcEvents.LOGS});
  });
}

function stopServer(callback?: Function) {
  httpServer?.stop(callback);
}

function ipcSendMessage(message: any) {
  mainWindow?.webContents.send("message", JSON.stringify(message));
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
        setInterval(() => logger.info("PING", new Date()), 5000);
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
        stopServer(() => { ipcSendMessage({ event: IpcEvents.STOP })});
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
