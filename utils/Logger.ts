import fs from 'node:fs';
import path from 'node:path';
import {exec} from'node:child_process';

import colors from 'colors';
import moment from 'moment';

export default class Logger {
    private _prefix: string = "Logger";

    constructor(prefix: string) {
        this._prefix = prefix;
    }

    static Levels = {
        ERROR: 1,
        WARN: 2,
        INFO: 3,
        DEBUG: 4
    };

    static Types = {
        ERROR: "error",
        WARN: "warn",
        INFO: "info",
        DEBUG: "debug"
    };

    static _configs: {
        appName: string, level: number, isWriteToFile: boolean, logDir: string, timeIncluded: boolean
    } = {
        appName: "logger",
        level: 4,
        isWriteToFile: false,
        logDir: "",
        timeIncluded: true
    };

    static config(configs: {appName: string, level: number, isWriteToFile: boolean, logDir: string, timeIncluded: boolean}): void {
        Logger._configs = configs;
    }

    private _listener = {
        all: new Array<Function>,
        error: new Array<Function>,
        warn: new Array<Function>,
        info: new Array<Function>,
        debug: new Array<Function>
    }

    on(event: 'all' | 'error' | 'warn' | 'info' | 'debug', fn: Function) {
        switch(event) {
            case 'all':
                this._listener.all.push(fn);
                break;
            case 'error':
                this._listener.error.push(fn);
                break;
            case 'warn':
                this._listener.warn.push(fn);
                break;
            case 'info':
                this._listener.info.push(fn);
                break;
            case 'debug':
                this._listener.debug.push(fn);
                break;
            default:
                break;
        }
    }

    removeAllListener() {
        Object.values(this._listener).forEach(listener => listener = []);
    }

    error(...msg: any) {
        let log_time = Logger._configs.timeIncluded ? new Date().toTimeString() : "";
        let category = colors.red(`[ERROR][${this._prefix}]`);
        console.log.apply(null, [[log_time, category].join(" "), ...msg]);
        if (Logger._configs.isWriteToFile) this._writefile(log_time, category, msg);
        this._listener.error.forEach(fn => fn(Logger.Types.ERROR, msg));
        this._listener.all.forEach(fn => fn(Logger.Types.ERROR, msg));
    }

    warn(...msg: any) {
        if (Logger._configs.level < Logger.Levels.WARN) return;
        let log_time = Logger._configs.timeIncluded ? new Date().toTimeString() : "";
        let category = colors.yellow(`[WARN][${this._prefix}]`);
        console.log.apply(null, [[log_time, category].join(" "), ...msg]);
        if (Logger._configs.isWriteToFile) this._writefile(log_time, category, msg);
        this._listener.error.forEach(fn => fn(Logger.Types.WARN, msg));
        this._listener.all.forEach(fn => fn(Logger.Types.WARN, msg));
    }

    info(...msg: any) {
        if (Logger._configs.level < Logger.Levels.INFO) return;
        let log_time = Logger._configs.timeIncluded ? new Date().toTimeString() : "";
        let category = colors.green(`[INFO][${this._prefix}]`);
        console.log.apply(null, [[log_time, category].join(" "), ...msg]);
        this._listener.error.forEach(fn => fn(Logger.Types.INFO, msg));
        this._listener.all.forEach(fn => fn(Logger.Types.INFO, msg));
        if (Logger._configs.isWriteToFile) this._writefile(log_time, category, msg);
    }

    debug(...msg: any) {
        if (Logger._configs.level < Logger.Levels.DEBUG) return;
        let log_time = Logger._configs.timeIncluded ? new Date().toTimeString() : "";
        let category = colors.blue(`[DEBUG][${this._prefix}]`);
        console.log.apply(null, [[log_time, category].join(" "), ...msg]);
        this._listener.debug.forEach(fn => fn(Logger.Types.DEBUG, msg));
        this._listener.all.forEach(fn => fn(Logger.Types.DEBUG, msg));
        // if (Logger._configs.isWriteToFile) this._writefile(log_time, category, msg);
    }

    private _writefile(log_time: String, category: String, msg: Array<any>) {
        if (!Logger._configs.isWriteToFile) return;
        if (!fs.existsSync(Logger._configs.logDir)){
            fs.mkdirSync(Logger._configs.logDir, { recursive: true });
        }
        const url = `${path.join(Logger._configs.logDir, Logger._configs.appName + "_" + moment().format("yyyyMMDD") + ".log")}`;
        let content = `${log_time} ${category} - ${msg.map(s => JSON.stringify(s)).join(", ")}`;
        exec(`echo "${content.replace(/[\\$'"]/g, "\\$&")}" >> ${url}`,
            (error, stdout, stderr) => {
                if (error) console.log('Write log error:', error.message, stderr);
            }
        );
    }
}
