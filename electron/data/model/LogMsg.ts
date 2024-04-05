const TYPES = {
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    DEBUG: "DEBUG",
}
export default class LogMsg {
    static Types = TYPES;

    type: string;
    content: string;

    constructor(type: string, content: string) {
        this.type = type;
        this.content = content;
    }
}
