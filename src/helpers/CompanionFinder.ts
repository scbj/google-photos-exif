import { Configuration } from "../models/Configuration"
import { TakeoutFileInfo } from "../models/File"
import { FileWriter } from "./FileWriter"
import { findCompanionFilePath } from "./find-companion-file-path"
import { findFilesWithExtensionRecursively } from "./find-files-with-extension-recursively"

class SomeCompanionNotFoundError extends Error {
  constructor() {
    super('Some files do not have a companion file. Please correct the problem before retrying the command. The list of affected files can be found in errors.txt')
  }
}

export class CompanionFinder {
  constructor(
    private readonly configuration: Configuration,
    private readonly fileWriter: FileWriter
  ) {}

  async scanInputDirectory(): Promise<TakeoutFileInfo[]> {
    const mediaFilePaths = await findFilesWithExtensionRecursively(
      this.configuration.inputDirectory,
      this.configuration.supportedMediaFileExtensions
    )
    const takeoutFiles: TakeoutFileInfo[] = []
    const errorFiles: string[] = []
    for (const mediaFilePath of mediaFilePaths) {
      const companionFilePath = findCompanionFilePath(mediaFilePath)
      companionFilePath
        ? takeoutFiles.push({ mediaFilePath, companionFilePath })
        : errorFiles.push(mediaFilePath)
    }

    if (errorFiles.length) {
      await this.createScanResultFiles({ mediaFiles: takeoutFiles, errorFiles })
      throw new SomeCompanionNotFoundError()
    }

    return takeoutFiles
  }

  private async createScanResultFiles(result: { mediaFiles: TakeoutFileInfo[], errorFiles: string[] }) {
    const takeoutFilesContent = result.mediaFiles.map(x => `${x.mediaFilePath} -> ${x.companionFilePath}`).join('\n')
    await this.fileWriter.writeErrorFile('takeout-files.txt', takeoutFilesContent)
    await this.fileWriter.writeErrorFile('errors.txt', result.errorFiles.join('\n'))
  }
}