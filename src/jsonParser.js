

class JsonParser {
  buffer: Buffer;
  constructor(input: ArrayBuffer) {
    this.buffer = (input) ? Buffer.from(input) : Buffer.from('');
  }

  onData(data: ArrayBuffer) {
    let chunk = Buffer.from(data);
    this.buffer = Buffer.concat([this.buffer, chunk]);
  }

  process() {
    try {
      return JSON.parse(this.buffer);
    } catch (err) {
      return null;
    }
  }
}
