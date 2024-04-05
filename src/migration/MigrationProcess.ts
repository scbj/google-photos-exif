import { Configuration } from "../Configuration";
import { FileSystemService } from "../file/FileSystemService";
import { SidecarFinder } from "../google-photos/SidecarFinder";
import { TakeoutAnalyser } from "../google-photos/TakeoutAnalyser";
import { Logger } from "../logs/Logger";
import { MigrationError } from "./errors/MigrationError";

export class MigrationProcess {
  private readonly fileSystemService: FileSystemService
  private readonly takeoutAnalyser: TakeoutAnalyser

  constructor(
    private readonly configuration: Configuration,
    private readonly logger: Logger
  ) {
    const fileSystemService = new FileSystemService()
    const sidecarFinder = new SidecarFinder(fileSystemService)

    this.fileSystemService = fileSystemService
    this.takeoutAnalyser = new TakeoutAnalyser(
      configuration,
      fileSystemService,
      sidecarFinder,
      logger
    )
  }

  async execute() {
    await this.prepareOutput()

    const [takeoutMedias, takeoutErrors] = await this.takeoutAnalyser.listMedias()
    if (takeoutErrors.length)
      return this.handleErrors(takeoutErrors)

    // ...
    this.logger.info('✅ Migration done')
  }

  private async handleErrors(errors: MigrationError[]) {
    const errorFileContent = errors.map(error => error.toString()).join('\n')
    const errorFilePath = this.fileSystemService.joinPath(
      this.configuration.outputDirectory,
      'errors.logs'
    )
    await this.fileSystemService.writeFile(errorFilePath, errorFileContent)

    console.log(`\n🤚 Migration stops. Error logs have been saved in ${errorFilePath} (error count: ${errors.length})\n`)
  }

  private async prepareOutput() {
    const { outputDirectory } = this.configuration
    const outputDirectoryExists = await this.fileSystemService.exists(outputDirectory)
    if (!outputDirectoryExists)
      await this.fileSystemService.createDirectory(outputDirectory)
  }
}