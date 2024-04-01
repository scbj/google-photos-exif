import { Configuration } from "../models/Configuration";
import { resolve } from 'path'

import { promises as fsPromises } from 'fs'

const { mkdir, writeFile } = fsPromises

export class FileWriter {
  constructor(private readonly configuration: Configuration) {}

  writeErrorFile(name: string, data: any) {
    const outputFilePath = resolve(this.configuration.errorDirectory, name)
    return writeFile(outputFilePath, data)
  }
}