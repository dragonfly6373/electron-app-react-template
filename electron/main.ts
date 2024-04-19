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
//     : app.getAppPath();

Logger.config({
  appName: 'my-electron',
  level: LOG_LEVEL,
  isWriteToFile: LOG_IS_WRITE_TO_FILE,
  logDir: path.join(app.getPath('userData'), "logs"),
  timeIncluded: LOG_TIME_INCLUDED
});

class Main {
  app: Electron.App;
  logger = new Logger("main");
  
  appSettings: AppConfig | null = null;
  
  mainWindow: BrowserWindow | null;
  httpServer: HttpServer | null;
  webView: BrowserWindow | null;
  showExitPrompt: boolean = true;

  constructor(app: Electron.App) {
    this.app = app;
    this.appSettings = configService.getAppConfig();
    this.mainWindow = null;
    this.httpServer = null;
    this.webView = null;
    this.logger.on("all", this._log.bind(this));
  
    this.app.on('ready', this.createWindow.bind(this))
      .whenReady()
      .then(this.registerListeners.bind(this))
      .catch(e => console.error(e));
  
    this.app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.app.quit();
      }
    });
    
    this.app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow()
      }
    });
  }

  private _log(type: string, message: string) {
    console.log(type, message);
    this.ipcSendMessage({ event: IpcEvents.LOGS, data: new LogMsg(type, message) });
  }

  createWindow () {
    console.log("# createWindow", {MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, MAIN_WINDOW_WEBPACK_ENTRY});
    
    this.mainWindow = new BrowserWindow({
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
  
    this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  
    this.mainWindow.on('close', (e: Event) => {
      e.preventDefault();
      if (!this.mainWindow?.isClosable() || !this.showExitPrompt) return;
      dialog.showMessageBox({
        title: 'Confirm',
        type: "warning",
        message: 'Are you sure you want to quit?',
        buttons: ['Yes', 'No'],
      }).then((confirm: any) => {
        if (confirm.response === 0) { // Runs the following if 'Yes' is clicked
          this.logger.info("Quit app confirm:", confirm.response);
          this.showExitPrompt = false;
          // mainWindow?.close();
          app.quit();
          process.exit();
        }
      });
    });
  }

  saveConfigs(config: AppConfig) {
    this.appSettings = configService.updateAppConfig(config);
    this.logger.info("saveConfig", this.appSettings);
    this.ipcSendMessage({
      event: IpcEvents.APP_INFO,
      data: { isRunning: this.httpServer?.isRunning() || false, configs: this.appSettings }
    });
  }
  
  async openChromeTab(url: string) {
    try {
      if (!USE_CHROME_BROWSER) {
        if (!this.webView || this.webView.isDestroyed()) this.webView = new BrowserWindow({
          icon: "",
          title: "Web view",
          width: 800, height: 600,
          autoHideMenuBar: true
        });
        // webView.setKiosk(true);
        this.webView.setFullScreen(true);
        this.webView.loadURL(url);
        this.webView.focus();
      } else {
        if (process.platform === 'win32') {
          exec(`start chrome ${url}`, (error: any, stdout: string, stderr: string) => {
            if (error) this.logger.error(stderr);
            else this.logger.info(stdout);
          });
        } else {
          exec(`google-chrome ${url}`, (error: any, stdout: string, stderr: string) => {
            if (error) this.logger.error(stderr);
            else this.logger.info(stdout);
          });
        }
      }
    } catch(err: any) {
      this.logger.error(err.message || err);
    }
  }
  
  startServer(port: number) {
    this.httpServer = HttpServer.getInstance();
    this.httpServer?.start(port, () => {
      this.logger.info(`server is running on port: ${port}`);
      this.ipcSendMessage({ event: IpcEvents.APP_INFO, data: { isRunning: this.httpServer?.isRunning() || false, configs: configService.getAppConfig() } });
      // if (this.appSettings?.autoOpenClient) {
      //   this.openChromeTab(this.appSettings.clientUrl || DEFAULT_CLIENT_URL);
      // }
    });
    this.httpServer?.addListener(IpcEvents.POST, (data) => {
      this.logger.info("[REQUES] post data", JSON.stringify(data));
      this.openChromeTab(`${this.appSettings?.clientUrl || DEFAULT_CLIENT_URL}`);
    });
    this.httpServer?.addListener(IpcEvents.STOP, (data) => {
      this.logger.warn(`[HTTP] Event.${IpcEvents.STOP}`);
      this.ipcSendMessage({ event: IpcEvents.APP_INFO, data: { isRunning: this.httpServer?.isRunning() || false, configs: configService.getAppConfig() } });
    });
    this.httpServer?.addListener(IpcEvents.LOGS, (data) => {
      this.logger.info(`[HTTP] Event.${IpcEvents.LOGS}`);
      this.ipcSendMessage({event: IpcEvents.LOGS, data});
    });
  }

  stopServer(callback?: Function) {
    this.httpServer?.stop(callback);
  }
  
  ipcSendMessage(message: {event: string, data: any}) {
    this.mainWindow?.webContents.send("message", message);
  }


  async registerListeners () {
    // const settings = configService.getAppConfig();
    if (this.appSettings?.autoStartServer) {
      this.startServer(this.appSettings.serverPort);
    }
    if (this.appSettings?.autoOpenClient) {
      this.openChromeTab(this.appSettings.clientUrl || DEFAULT_CLIENT_URL);
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
          this.ipcSendMessage({ event: IpcEvents.APP_INFO, data: { isRunning: this.httpServer?.isRunning() || false, configs: configService.getAppConfig() } });
          // setInterval(() => logger.info("PING", new Date()), 5000);
          break;
        }
        case 'config': {
          this.saveConfigs(data);
          break;
        }
        case 'start': {
          this.startServer(this.appSettings?.serverPort || DEFAULT_PORT);
          break;
        }
        case 'stop': {
          this.stopServer(() => {
            /* ipcSendMessage({ event: IpcEvents.STOP, data: "stop server" }) */
            this.httpServer?.removeAllListeners();
          });
          break;
        }
        case 'client': {
          this.openChromeTab(this.appSettings?.clientUrl || DEFAULT_CLIENT_URL);
          break;
        }
        default: break;
      }
    });
  }

  uncaughtErrorHandler(options: any, exitCode: number) {
    try {
      if (exitCode) this.logger.error("uncaughtErrorHandler", options, exitCode);
      if (options.cleanup) {
        if (this.webView?.isClosable()) this.webView?.close();
        console.log('cleanup application');
      }
    } catch(error: any) {
      console.error("kill all child processes failed with error", error.message);
    } finally {
      if (exitCode || exitCode === 0) console.log(exitCode);
      if (options.exit) process.exit();
    }
  }
}

const main = new Main(app);
// do something when app is closing
process.on('exit', main.uncaughtErrorHandler.bind(main, {cleanup: true}));
