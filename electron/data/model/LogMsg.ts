const TYPES = {
    ERROR: "error",
    WARN: "warn",
    INFO: "info",
    DEBUG: "debug",
}
export default class LogMsg {
    static Types = TYPES;

    type: string;
    content: string;
    time: number;

    constructor(type: string, content: string) {
        this.type = type;
        this.content = content;
        this.time = new Date().getTime();
    }
}
