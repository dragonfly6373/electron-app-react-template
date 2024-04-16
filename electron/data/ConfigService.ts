import Store, { Schema } from 'electron-store';
import AppConfig from "./model/AppConfig";
import AppInfo from "./model/AppInfo";
import * as application from "../../package.json";

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

class ConfigService {
    store: Store<AppConfig>;
    appConfig: AppConfig;
    constructor() {
        this.store = new Store<AppConfig>({ schema });
        console.log("storage path", this.store.path);
        
        this.appConfig = this.getAppConfig();
    }

    updateAppConfig(config: AppConfig) {
        Object.entries(config).forEach(([key, value]) => {
            console.log("# update", key, value);

            switch(key) {
                case "autoOpenClient":
                    this.setAutoOpenClient(value);
                    break;
                case "autoStartServer":
                    this.setAutoStartServer(value);
                    break;
                case "serverPort":
                    this.setServerPort(value);
                    break;
                case "clientUrl":
                    this.setClientUrl(value);
                    break;
                default:
                    break;
            }
        });
        this.appConfig = config;
        return config;
    }

    setAutoOpenClient(value: boolean) {
        try {
            this.store.set("autoOpenClient", value);
        } catch(error) {
            console.log("failed to set autoOpenClient value:", value);
        }
    }

    setAutoStartServer(value: boolean) {
        try {
            this.store.set("autoStartServer", value);
        } catch(error) {
            console.log("failed to set autoStartServer value:", value);
        }
    }

    setServerPort(value: number) {
        try {
            this.store.set("serverPort", value);
        } catch(error) {
            console.log("failed to set serverPort value:", value);
        }
    }

    setClientUrl(value: string) {
        try {
            this.store.set("clientUrl", value);
        } catch(error) {
            console.log("failed to set clientUrl value:", value);
        }
    }

    getAppConfig(): AppConfig {
        console.log("# getAppConfig");
        
        const autoStartServer = this.store.get("autoStartServer");
        const autoOpenClient = this.store.get("autoOpenClient");
        const serverPort = this.store.get("serverPort");
        const clientUrl = this.store.get("clientUrl");
        return {
            autoOpenClient,
            autoStartServer,
            serverPort,
            clientUrl
        };
    }

    getAppInfo(): AppInfo {
        const {
            name,
            author,
            version,
            copyright,
            description
        } = application;
        return {
            name,
            author,
            version,
            copyright,
            description
        };
    }
}

export default new ConfigService();
