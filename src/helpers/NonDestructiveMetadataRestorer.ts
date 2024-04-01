import { promises as fspromises, utimesSync } from "fs";
import { Configuration } from "../models/Configuration";
import { MediaFileInfo } from "../models/File";
import { basename, extname, resolve } from "path";
import { ExifMetadataReader } from "./ExifMetadataReader";
import { ExifMetadataWriter } from "./ExifMetadataWriter";

const { copyFile } = fspromises

export class NonDestructiveMetadataRestorer {
  constructor(
    private readonly configuration: Configuration,
    private readonly exifMetadataReader: ExifMetadataReader,
    private readonly exifMetadataWriter: ExifMetadataWriter
  ) {}

  async copyAndRestore(mediaFiles: MediaFileInfo[]) {
    const unavailableFileNames: string[] = []
    for (const mediaFile of mediaFiles) {
      console.log(`💾 Copy ${mediaFile.path}`)
      const outputFilePath = this.generateOutputFilePath(mediaFile, unavailableFileNames)
      await copyFile(mediaFile.path, outputFilePath)
      await this.updateMetadata(mediaFile, outputFilePath)
    }
  }

  private generateOutputFilePath(mediaFile: MediaFileInfo, unavailableFileNames: string[]) {
    const name = mediaFile.name
    const extension = extname(mediaFile.path)
    const nameWithoutExtension = basename(mediaFile.path, extension)

    let counter = 1
    let outputFileName = name
    while(unavailableFileNames.includes(outputFileName.toLowerCase())) {
      outputFileName = `${nameWithoutExtension}_${counter}${extension}`
      counter++
    }
    unavailableFileNames.push(outputFileName)

    return resolve(this.configuration.outputDirectory, outputFileName)
  }

  private async updateExifMetadata(mediaFile: MediaFileInfo, outputFilePath: string) {
    const actualTags = await this.exifMetadataReader.read(outputFilePath)
    if (!actualTags?.creationDate || actualTags.creationDate > mediaFile.creationDate)
      await this.exifMetadataWriter.write(outputFilePath, { creationDate: mediaFile.creationDate })

    if (mediaFile.geographicCoordinate && !actualTags?.geographicCoordinate)
      await this.exifMetadataWriter.write(outputFilePath, { geographicCoordinate: mediaFile.geographicCoordinate })
  }

  private async updateMetadata(mediaFile: MediaFileInfo, outputFilePath: string) {
    if (this.exifMetadataReader.isSupported(outputFilePath)) {
      await this.updateExifMetadata(mediaFile, outputFilePath)
    }

    utimesSync(outputFilePath, mediaFile.creationDate, mediaFile.creationDate)
  }
}