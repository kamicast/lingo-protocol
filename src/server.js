// @flow
import EventEmitter from 'events';
import SSDP         from 'simple-service-discovery-protocol';
import DEVICE       from './device';
import uWS, {
  Websocket,
  HttpRequest,
  HttpResponse
} from 'uWebSockets.js';
import {
  arrayBufferToString,
  arrayBufferToJSON,
  ipToString,
  abToBencodeToJSON
  } from './utilities';

const debug = require('debug')('lingo');

type Options = {
  serverPrefix: string,
  port:         number
};

type Device = {
  name:         string,
  UUID:         string,
  type:         string,
  version:      string,
  serverPrefix: string
};

type Message = {
  type: 'open' | 'close' | 'cmd',
  open: 'app' | 'video' | 'audio' | 'image',
  cmd?: string
};

class LingoServer extends EventEmitter {
  uws:          uWS;
  serverPrefix: string;
  port:         number;
  busy:         boolean;
  device:       Device;
  setupServer:  Function;
  _onOpen:      Function;
  _onClose:     Function;
  _onMessage:   Function;
  _onDrain:     Function;
  _onClose:     Function;
  constructor(options: Options | Object) {
    super();
    if (!options) options = {};
    this.serverPrefix = options.serverPrefix || '';
    if (this.serverPrefix !== '' && this.serverPrefix[0] !== '/')
      this.serverPrefix = '/' + this.serverPrefix;
    this.port   = options.port || 9001;
    this.busy   = false;
    this.device = DEVICE;
    this.setupServer();
  }

  setupServer(): void {
    const self = this;
    self.uws = uWS.App();
    self.uws.get(self.serverPrefix + '/device.json', (res: HttpResponse, req: HttpRequest) => {
      res.writeStatus('200 OK');
      res.writeHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(self.device));
    });
    self.uws.get(self.serverPrefix + '/is-busy', (res: HttpResponse, req: HttpRequest) => {
      res.writeStatus('200 OK');
      res.writeHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(self.busy));
    });
    self.uws.ws(self.serverPrefix + '/*', {
      compression: 0,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 10,
      open: self._onOpen.bind(self),
      message: self._onMessage.bind(self),
      drain: self._onDrain.bind(self),
      close: self._onClose.bind(self)
    });
    self.uws.any('/*', (res: HttpResponse, req: HttpRequest) => {
      res.writeStatus('404');
      res.end();
    });
    self.uws.listen(this.port, token => { if (token) debug(`listening on port ${this.port}`); });
  }

  /** Lingo Message Protocol **/
  _handleMessage(msg: null | Message): void {
    if (!msg || this.busy)
      return;
    debug('message: %o', msg);
    if (msg.type === 'open') {
      switch (msg.open) {
        case 'app':
          this._onApp(msg);
          break;
        case 'video':
          this._onVideo(msg);
          break;
        case 'audio':
          this._onAudio(msg);
          break;
        case 'image':
          this._onImage(msg);
          break;
        default:
          null;
      }
    } else if (msg.type === 'close') {

    } else if (msg.type === 'cmd') {

    }
  }

  _onApp(msg: Message): void {

  }

  _onVideo(msg: Message): void {

  }

  _onAudio(msg: Message): void {

  }

  _onImage(msg: Message): void {

  }

  /** WebSocket Functions **/
  _onOpen(ws: Websocket, req: HttpRequest): void {
    ws.headers = {};
    req.forEach((key, value) => { ws.headers[key] = value; });
    debug('opened websocket: %s', req.getUrl());
  }

  _onMessage(ws: Websocket, message: ArrayBuffer, isBinary: boolean): void {
    debug('message - length: %d, binary: %o', message.byteLength, isBinary);
    if (ws.headers['content-type'] && ws.headers['content-type'] === 'application/json')
      this._handleMessage(arrayBufferToJSON(message));
    else if (ws.headers['content-type'] && ws.headers['content-type'] === 'application/bencode')
      this._handleMessage(abToBencodeToJSON(message));
    else
      this._handleMessage(arrayBufferToJSON(message)); // default to json
  }

  _onDrain(ws: Websocket): void {
    let bufferedAmount: number = ws.getBufferedAmount();
    debug('WebSocket backpressure: %d', bufferedAmount);
    this.emit('drain', bufferedAmount);
  }

  _onClose(ws: Websocket, code: number, messag: ArrayBuffer): void {
    debug('WebSocket closed: %s', ipToString(ws.getRemoteAddress()));
  }
}

export default LingoServer;
