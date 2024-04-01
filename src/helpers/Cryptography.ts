import { createHash } from 'crypto'
import { createReadStream, readFileSync } from 'fs';
import {Stream} from 'stream'

export class Cryptography {
  constructor() {}

  hashFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }
}