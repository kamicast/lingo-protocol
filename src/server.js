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
  jsonToBuffer,
  ipToString,
  abToBencodeToJSON
} from './utilities';

import type Device from './device';

const debug = require('debug')('lingo');

export type Options = {
  serverPrefix: string,
  port:         number
};

export type Message = {
  type:   'open' | 'close' | 'cmd',
  open?:  'app' | 'video' | 'audio' | 'image',
  cmd?:   'play' | 'pause' | 'next' | 'previous' | 'restart',
  app?:   Application,
  video?: Video,
  audio?: Audio,
  image?: Image
};

export type Application = {
  name:      string,
  link:      string,
  websocket: boolean,
  subTopics: [string]
};

export type Video = {
  metadata: Object
};

export type Audio = {
  metadata: Object
};

export type Image = {
  metadata: Object
};

class LingoServer extends EventEmitter {
  uws:          uWS;
  serverPrefix: string;
  port:         number;
  busy:         boolean;
  device:       Device;
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

  setBusy(status: boolean): void {
    this.busy = status;
  }

  /** Lingo Message Protocol **/
  _handleMessage(msg: null | Message): void {
    if (!msg || this.busy)
      return;
    debug('message: %o', msg);
    if (msg.type === 'open' && msg.open && msg[msg.open]) {
      this.emit('open', msg.open, msg[msg.open]);
    } else if (msg.type === 'close') {
      this.emit('close');
    } else if (msg.type === 'cmd' && msg.cmd) {
      this.emit(msg.cmd);
    }
  }

  /** WebSocket Functions **/
  _onOpen(ws: Websocket, req: HttpRequest): void {
    ws.headers = {};
    req.forEach((key, value) => { ws.headers[key] = value; });
    debug('opened websocket: %s', req.getUrl());
  }

  _onMessage(ws: Websocket, message: ArrayBuffer, isBinary: boolean): void {
    debug('message - length: %d, binary: %o', message.byteLength, isBinary);
    if (!ws.headers['content-type'])
      this._handleMessage(arrayBufferToJSON(message)); // default to json
    else if (ws.headers['content-type'] === 'application/json')
      this._handleMessage(arrayBufferToJSON(message));
    else if (ws.headers['content-type'] === 'application/bencode')
      this._handleMessage(abToBencodeToJSON(message));
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
