import { exec } from 'node:child_process';
import path from 'node:path';
import { app, BrowserWindow, dialog, Event, ipcMain } from 'electron';
import dotenv from 'dotenv';
import { parseBoolean } from '../utils/StringUtil';
import HttpServer from './server';
import configService from './data/ConfigService';
import AppConfig from './data/model/AppConfig';
import LogMsg from './data/model/LogMsg';
import Logger from '../utils/Logger';

dotenv.config();

const DEFAULT_PORT = parseInt(process.env.SERVER_PORT || '9001');
const USE_CHROME_BROWSER = parseBoolean(process.env.USE_CHROME_BROWSER || "false");
const DEFAULT_CLIENT_URL = process.env.CLIENT_URL || "https://docs.fedoraproject.org";

const LOG_LEVEL = parseInt(process.env.LOG_LEVEL || "3");
const LOG_IS_WRITE_TO_FILE = parseBoolean(process.env.LOG_IS_WRITE_TO_FILE || "false");
const LOG_TIME_INCLUDED = parseBoolean(process.env.LOG_TIME_INCLUDED || "false");

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
Logger.config({
  appName: 'my-electron',
  level: LOG_LEVEL,
  isWriteToFile: LOG_IS_WRITE_TO_FILE,
  logDir: path.join(app.getPath('userData'), "logs"),
  timeIncluded: LOG_TIME_INCLUDED
});

let logger = new Logger("main");

let appSettings = configService.getAppConfig();

let mainWindow: BrowserWindow | null;
let httpServer: HttpServer | null;
let webView: BrowserWindow | null;
let showExitPrompt = true;

function createWindow () {
  console.log("# createWindow", {MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, MAIN_WINDOW_WEBPACK_ENTRY});
  
  mainWindow = new BrowserWindow({
    // icon: path.join(app.getAppPath(), 'assets', 'icon.png'),
    width: 520,
    height: 320,
    minWidth: 520,
    minHeight: 320,
    backgroundColor: '#FFF',
    autoHideMenuBar: true,
    webPreferences: {
      // devTools: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('close', (e: Event) => {
    e.preventDefault();
    if (!mainWindow?.isClosable() || !showExitPrompt) return;
    dialog.showMessageBox({
      title: 'Confirm',
      type: "warning",
      message: 'Are you sure you want to quit?',
      buttons: ['Yes', 'No'],
    }).then((confirm: any) => {
      if (confirm.response === 0) { // Runs the following if 'Yes' is clicked
        logger.info("Quit app confirm:", confirm.response);
        showExitPrompt = false;
        // mainWindow?.close();
        app.quit();
        process.exit();
      }
    });
  });
  // let index = 0;
  // setInterval(() => {logger.debug("test log " + index)}, 2000);
}

function saveConfigs(config: AppConfig) {
  appSettings = configService.updateAppConfig(config);
  logger.info("saveConfig", appSettings);
  ipcSendMessage({
    event: IpcEvents.APP_INFO,
    data: { isRunning: httpServer?.isRunning() || false, configs: appSettings }
  });
}

async function openChromeTab(url: string) {
  try {
    if (!USE_CHROME_BROWSER) {
      if (!webView || webView.isDestroyed()) webView = new BrowserWindow({
        icon: "",
        title: "Web view",
        width: 800, height: 600,
        autoHideMenuBar: true
      });
      // webView.setKiosk(true);
      webView.setFullScreen(true);
      webView.loadURL(url);
      webView.focus();
    } else {
      if (process.platform === 'win32') {
        exec(`start chrome ${url}`, (error: any, stdout: string, stderr: string) => {
          if (error) logger.error(stderr);
          else logger.info(stdout);
        });
      } else {
        exec(`google-chrome ${url}`, (error: any, stdout: string, stderr: string) => {
          if (error) logger.error(stderr);
          else logger.info(stdout);
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
    logger.info(`server is running on port: ${port}`);
    ipcSendMessage({ event: IpcEvents.APP_INFO, data: { isRunning: httpServer?.isRunning() || false, configs: configService.getAppConfig() } });
    if (appSettings.autoOpenClient) {
      openChromeTab(appSettings.clientUrl || DEFAULT_CLIENT_URL);
    }
  });
  httpServer?.addListener(IpcEvents.POST, (data) => {
    logger.info("[REQUES] post data", data);
    openChromeTab('https://docs.fedoraproject.org/en-US/fedora/latest/');
  });
  httpServer?.addListener(IpcEvents.STOP, (data) => {
    logger.warn(`[HTTP] Event.${IpcEvents.STOP}`);
    ipcSendMessage({ event: IpcEvents.APP_INFO, data: { isRunning: httpServer?.isRunning() || false, configs: configService.getAppConfig() } });
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
logger.on("all", _log);

/* const logger = {
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
}; */

async function registerListeners () {
  const settings = configService.getAppConfig();
  if (settings.autoStartServer) {
    startServer(settings.serverPort);
  }
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
        ipcSendMessage({ event: IpcEvents.APP_INFO, data: { isRunning: httpServer?.isRunning() || false, configs: configService.getAppConfig() } });
        // setInterval(() => logger.info("PING", new Date()), 5000);
        break;
      }
      case 'config': {
        saveConfigs(data);
        break;
      }
      case 'start': {
        startServer(appSettings.serverPort || DEFAULT_PORT);
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
      if (webView?.isClosable()) webView?.close();
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
