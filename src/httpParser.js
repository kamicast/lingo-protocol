// @flow
import bencode from 'bencode';

import type Message from './server';

export type Application = 'application/json' | 'application/bencode';

class httpParser {
  buffer:          Buffer;
  applicationType: Application;
  constructor(input: ArrayBuffer, applicationType: Application) {
    this.buffer = (input) ? Buffer.from(input) : Buffer.from('');
    this.applicationType = applicationType;
  }

  onData(data: ArrayBuffer): void {
    let chunk = Buffer.from(data);
    this.buffer = Buffer.concat([this.buffer, chunk]);
  }

  process(): null | Message {
    try {
      if (!this.applicationType)
        return JSON.parse(this.buffer.toString());
      else if (this.applicationType === 'application/json')
        return JSON.parse(this.buffer.toString());
      else if (this.applicationType === 'application/bencode')
        return bencode.decode(this.buffer, 'utf8');
      else
        return null;
    } catch (err) {
      return null;
    }
  }
}

export default httpParser;
