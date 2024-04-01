import { createHash } from 'crypto'
import { readFileSync } from 'fs';

export class FileSha256 {
  constructor() {}
  
  hash(filePath: string) {
    const fileBuffer = readFileSync(filePath);
    const hashSum = createHash('sha256');
    hashSum.update(fileBuffer);
    
    return hashSum.digest('hex');
  }
}