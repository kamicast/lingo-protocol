// @flow
import bencode from 'bencode';

export function arrayBufferToString(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString();
}

export function arrayBufferToJSON(buf: ArrayBuffer): null | Object {
  try {
    return JSON.parse(Buffer.from(buf).toString());
  } catch (err) {
    return null;
  }
}

export function jsonToBuffer(json: object): Buffer {
  return Buffer.from(JSON.stringify(json));
}

export function abToBencodeToJSON(buf: ArrayBuffer): null | Object {
  try {
    return bencode.decode(Buffer.from(buf), 'utf8');
  } catch (err) {
    return null;
  }
}

export function ipToString(buf: ArrayBuffer): string {
  return new Uint8Array(buf).slice(-4).join('.');
}
