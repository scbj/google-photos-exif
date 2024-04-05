import Command, { flags } from "@oclif/command";
import * as Parser from '@oclif/parser';
import { Configuration } from "./Configuration";
import { MigrationProcess } from "./migration/MigrationProcess";
import { OpenCliFrameworkLogger } from "./logs/OclifLogger";

export class AppCommand extends Command {
  static description = 'Not defined'

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    inputDirectory: flags.string({
      char: 'i',
      description: 'Directory containing the extracted contents of Google Photos Takeout compressed files',
      required: true
    }),
    outputDirectory: flags.string({
      char: 'o',
      description: 'Directory into which the processed output will be written',
      required: true
    })
  }

  static args: Parser.args.Input = []

  async run() {
    const { flags} = this.parse(AppCommand);
    const { inputDirectory, outputDirectory } = flags;

    const configuration: Configuration = {
      inputDirectory,
      outputDirectory,
      supportedMediaFileExtensions: [
        '.jpeg',
        '.jpg',
        '.heic',
        '.gif',
        '.mp4',
        '.png',
        '.avi',
        '.mov'
      ],
      verboseLogs: true
    }
    const logger = new OpenCliFrameworkLogger(this, configuration)
    try {
      const migrationProcess = new MigrationProcess(configuration, logger)
      await migrationProcess.execute()
    } catch (error) {
      if (error instanceof Error)
        this.error(error)

      this.exit(1)
    }

    this.exit(0)
  }
}