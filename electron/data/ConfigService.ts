import Store, { Schema } from 'electron-store';
import AppConfig from "./model/AppConfig";

const schema: Schema<AppConfig> = {
    autoOpenClient: {
        type: "boolean",
        default: false
    },
    autoStartServer: {
        type: "boolean",
        default: false
    },
    serverPort: {
        type: "number",
        default: 9001
    },
    clientUrl: {
        type: "string",
        default: ""
    }
}

const store = new Store<AppConfig>({ schema });

class ConfigService {
    appConfig: AppConfig;
    constructor() {
        this.appConfig = new AppConfig();
    }

    updateAppConfig(config: AppConfig) {
        Object.entries(config).forEach(([key, value]) => {
            store.set(key, value);
        });
        this.appConfig = config;
    }

    getAppConfig() {
        this.appConfig.autoStartServer = store.get("autoStartServer");
        this.appConfig.autoOpenClient = store.get("autoOpenClient");
        this.appConfig.serverPort = store.get("serverPort");
        this.appConfig.clientUrl = store.get("clientUrl");
        return this.appConfig;
    }
}

export default new ConfigService();
