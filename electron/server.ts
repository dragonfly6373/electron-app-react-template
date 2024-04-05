import http from 'node:http';
import EventEmitter from 'node:events';

var INSTANCE: any;

export const Events = {
    POST: "server:post",
    START: "server:start",
    STOP: "server:stop"
};

export default class HttpServer extends EventEmitter {
    server: any;

    static Events = Events;
    static getInstance() {
        if (INSTANCE) return INSTANCE;
        INSTANCE = new HttpServer();
        return INSTANCE;
    }

    private constructor() {
        super();
        this.server = this.createServer();
    }

    createServer() {
        let server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
            switch(req.url) {
                case "/post": {
                    let result = "";
                    req.on("data", (data: any) => {
                        result += data;
                    });
                    req.on('end', () => {
                        console.log('request body: ' + result);
                        this.emit(Events.POST, JSON.parse(result));
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({
                            code: 200,
                            success: true
                        }));
                      });
                    break;
                }
                default: {
                    res.writeHead(404, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({
                        code: 404,
                        message: "HTTP Error. The requested resource is not found"
                    }));
                    break;
                }
            }
        });
        server.on("close", () => {
            this.emit(Events.STOP, JSON.stringify({closed: true}));
        });
        return server;
    }

    isRunning() {
        return this.server.listening;
    }

    start(port: number, callback: Function = () => {}) {
        this.server.listen(port, callback);
    }

    stop(callback?: Function) {
        this.server.close(callback);
    }
}
