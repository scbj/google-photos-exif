import { FileSystemService } from "../file/FileSystemService";

export class SidecarFinder {
  constructor(private readonly fileSystemService: FileSystemService) {}
  
  async find(mediaFilePath: string) {
    const potentialSidecarFileNames = this.generatePotentialSidecarFileName(mediaFilePath)
    const directoryPath = this.fileSystemService.getDirectoryPath(mediaFilePath)

    for (const potentialSidecarFileName of potentialSidecarFileNames) {
      const path = this.fileSystemService.joinPath(directoryPath, potentialSidecarFileName)
      if (await this.fileSystemService.exists(path))
        return path
    }
  }

  private * generatePotentialSidecarFileName(mediaFilePath: string) {
    const extension = this.fileSystemService.getExtension(mediaFilePath)
    const originalName = this.fileSystemService.getNameWithoutExtension(mediaFilePath)
    const name = this.removeEditedSuffix(originalName)
    
    yield `${name}.json`
    yield `${name}..json`
    yield `${name}.j.json`
    yield `${name}.jp.json`
    yield `${name}.jpe.json`
    yield `${name}.jpg.json`
    yield `${name}${extension}.json`
    yield `${name.replace(/_[a-z]$/i, '_')}.json`
    yield `${name.replace(/-\d$/, '-')}.json`
    yield `${name.slice(0, -1)}.json`

    const nameWithCounterMath = name.match(/(?<name>.*)(?<counter>\(\d+\))$/)
    const nameWithoutCounter = nameWithCounterMath?.groups?.['name']
    const counter = nameWithCounterMath?.groups?.['counter']
    if (nameWithoutCounter && counter) {
      yield `${nameWithoutCounter}${extension}${counter}.json`
      yield `${nameWithoutCounter.slice(0, -1)}${counter}.json`
      yield `${nameWithoutCounter.replace(/_[a-z]$/i, '_')}.json`
      yield `${nameWithoutCounter.replace(/-\d$/i, '-')}.json`
      yield `${nameWithoutCounter.slice(0, -1)}.json`
      yield `${nameWithoutCounter}.jpg${counter}.json`
    }
  }

  private removeEditedSuffix(name: string) {
    const nameWithEditedMatch = name.match(/(?<name>.*)-(modifié|edited)(?<counter>\(\d\))?$/)
    const nameWithoutSuffix = nameWithEditedMatch?.groups?.['name']
    const counter = nameWithEditedMatch?.groups?.['counter']
    if (!nameWithoutSuffix)
      return name

    return counter
      ? `${nameWithoutSuffix}${counter}`
      : nameWithoutSuffix
  }
}