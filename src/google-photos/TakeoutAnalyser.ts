import { Configuration } from "../Configuration"
import { FileSystemService } from "../file/FileSystemService"
import { Logger } from "../logs/Logger"
import { SidecarFileNotFoundError } from "../migration/errors/SidecarFileNotFoundError"
import { SidecarFinder } from "./SidecarFinder"
import { TakeoutMedia } from "./TakeoutMedia"

export class TakeoutAnalyser {
  constructor(
    private readonly configuration: Configuration,
    private readonly fileSystemService: FileSystemService,
    private readonly sidecarFinder: SidecarFinder,
    private readonly logger: Logger
  ) {}
  
  async listMedias() {
    this.logger.info('🔍 Scanning the Google Photos Takeout directory...')
    
    const mediaFilePaths = this.fileSystemService.listFilesRecursively(
      this.configuration.inputDirectory,
      {
        includeExtensions: this.configuration.supportedMediaFileExtensions
      }
    )
    const takeoutMedia: TakeoutMedia[] = []
    const errors: Error[] = []
    for await (const mediaFilePath of mediaFilePaths) {
      const sidecarFilePath = await this.sidecarFinder.find(mediaFilePath)
      if (!sidecarFilePath) {
        const error = new SidecarFileNotFoundError(mediaFilePath)
        this.logger.error(error.message)
        errors.push(error)
        continue
      }
      
      takeoutMedia.push(new TakeoutMedia(mediaFilePath, sidecarFilePath))
    }

    return [ takeoutMedia, errors ] as const
  }
}