import { Command, flags } from '@oclif/command';
import * as Parser from '@oclif/parser';
import { existsSync, promises as fspromises, write } from 'fs';
import { Directories } from './models/directories'
import { GooglePhotoTakeoutManager } from './helpers/GooglePhotoTakeoutManager';
import { Configuration } from './models/Configuration';

const { readdir, mkdir, copyFile, writeFile } = fspromises;

class GooglePhotosExif extends Command {
  static description = `Takes in a directory path for an extracted Google Photos Takeout. Extracts all photo/video files (based on the conigured list of file extensions) and places them into an output directory. All files will have their modified timestamp set to match the timestamp specified in Google's JSON metadata files (where present). In addition, for file types that support EXIF, the EXIF "DateTimeOriginal" field will be set to the timestamp from Google's JSON metadata, if the field is not already set in the EXIF metadata.`;

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    inputDir: flags.string({
      char: 'i',
      description: 'Directory containing the extracted contents of Google Photos Takeout zip file',
      required: true,
    }),
    outputDir: flags.string({
      char: 'o',
      description: 'Directory into which the processed output will be written',
      required: true,
    }),
    errorDir: flags.string({
      char: 'e',
      description: 'Directory for any files that have bad EXIF data - including the matching metadata files',
      required: true,
    }),
  }

  static args: Parser.args.Input  = []

  async run() {
    const { args, flags} = this.parse(GooglePhotosExif);
    const { inputDir, outputDir, errorDir } = flags;

    try {
      const directories = this.determineDirectoryPaths(inputDir, outputDir, errorDir);
      await this.prepareDirectories(directories);
      await this.processMediaFiles(directories);
    } catch (error) {
      if (error instanceof Error)
        this.error(error);
      
      this.exit(1);
    }

    this.log('Done 🎉');
    this.exit(0);
  }

  private determineDirectoryPaths(inputDir: string, outputDir: string, errorDir: string): Directories {
    return {
      input: inputDir,
      output: outputDir,
      error: errorDir,
    };
  }

  private async prepareDirectories(directories: Directories): Promise<void> {
    if (!directories.input || !existsSync(directories.input)) {
      throw new Error('The input directory must exist');
    }

    if (!directories.output) {
      throw new Error('You must specify an output directory using the --outputDir flag');
    }

    if (!directories.error) {
      throw new Error('You must specify an error directory using the --errorDir flag');
    }

    await this.checkDirIsEmptyAndCreateDirIfNotFound(directories.output, 'If the output directory already exists, it must be empty');
    await this.checkDirIsEmptyAndCreateDirIfNotFound(directories.error, 'If the error directory already exists, it must be empty');
  }

  private async checkDirIsEmptyAndCreateDirIfNotFound(directoryPath: string, messageIfNotEmpty: string): Promise<void> {
    const folderExists = existsSync(directoryPath);
    if (folderExists) {
      const folderContents = await readdir(directoryPath);
      const folderContentsExcludingDSStore = folderContents.filter(filename => filename !== '.DS_Store');
      const folderIsEmpty = folderContentsExcludingDSStore.length === 0;
      if (!folderIsEmpty) {
        throw new Error(messageIfNotEmpty);
      }
    } else {
      this.log(`--- Creating directory: ${directoryPath} ---`);
      await mkdir(directoryPath);
    }
  }

  private async processMediaFiles(directories: Directories): Promise<void> {
    const configuration: Configuration = {
      inputDirectory: directories.input,
      outputDirectory: directories.output,
      errorDirectory: directories.error,
      supportedMediaFileExtensions: [
        '.jpeg',
        '.jpg',
        '.heic',
        '.gif',
        '.mp4',
        '.png',
        '.avi',
        '.mov'
      ]
    }
    const googlePhotoTakeoutManager = new GooglePhotoTakeoutManager(configuration)
    await googlePhotoTakeoutManager.execute()
  }
}

export = GooglePhotosExif
