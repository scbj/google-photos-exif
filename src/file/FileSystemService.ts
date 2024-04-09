import { promises, constants } from 'fs'
import { basename, dirname, extname, join, resolve } from "path";

export class FileSystemService {
  copyFile(sourceFilePath: string, destinationFilePath: string): Promise<void> {
    return promises.copyFile(sourceFilePath, destinationFilePath)
  }

  createDirectory(path: string) {
    return promises.mkdir(path)
  }

  async exists(path: string) {
    return promises.access(path, constants.F_OK)
      .then(() => true)
      .catch(() => false)
  }

  getDirectoryPath(path: string) {
    return dirname(path)
  }

  getExtension(path: string) {
    return extname(path)
  }

  async * listFilesRecursively(
    directoryPath: string,
    options: { includeExtensions: string[] }
  ): AsyncGenerator<string> {
    const entries = await promises.readdir(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const path = this.joinPath(directoryPath, entry.name)
      const extension = this.getExtension(path).toLowerCase()
      const isInclude = options.includeExtensions
        .map(x => x.toLowerCase())
        .includes(extension)
        
      if (entry.isDirectory())
          yield * this.listFilesRecursively(path, options);
      else if (isInclude)
        yield path;
    }
}

  getName(path: string) {
    return basename(path)
  }

  getNameWithoutExtension(path: string) {
    return basename(path, extname(path))
  }
  
  joinPath(...pathSegments: string[]): string {
    return resolve(...pathSegments)
  }

  writeFile(filePath: string, content: any) {
    return promises.writeFile(filePath, content)
  }
}