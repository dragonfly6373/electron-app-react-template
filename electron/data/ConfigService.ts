import AppConfig from "./model/AppConfig";

class ConfigService {
    appConfig: AppConfig;
    constructor() {
        this.appConfig = new AppConfig();
    }

    updateAppConfig(config: AppConfig) {
        this.appConfig = config;
    }

    getAppConfig() {
        return this.appConfig;
    }
}

export default new ConfigService();
