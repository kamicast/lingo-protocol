import bencode from 'bencode';

export function arrayBufferToString(buf: ArrayBuffer) {
  return Buffer.from(buf).toString();
}

export function arrayBufferToJSON(buf: ArrayBuffer) {
  try {
    return JSON.parse(Buffer.from(buf).toString());
  } catch (err) {
    return null;
  }
}

export function abToBencodeToJSON(buf: ArrayBuffer) {
  try {
    return bencode.decode(Buffer.from(buf), 'utf8');
  } catch (err) {
    return null;
  }
}

export function ipToString(buf: ArrayBuffer) {
  return new Uint8Array(buf).slice(-4).join('.');
}
