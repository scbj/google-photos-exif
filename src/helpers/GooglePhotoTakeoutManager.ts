import { Configuration } from "../models/Configuration";
import { CompanionFinder } from "./CompanionFinder";
import { Cryptography } from "./Cryptography";
import { ExifMetadataReader } from "./ExifMetadataReader";
import { ExifMetadataWriter } from "./ExifMetadataWriter";
import { FileWriter } from "./FileWriter";
import { GooglePhotoMetadataReader } from "./GooglePhotoMetadataReader";
import { MostRelevantMetadataResolver } from "./MostRelevantMetadataResolver";
import { NonDestructiveMetadataRestorer } from "./NonDestructiveMetadataRestorer";

export class GooglePhotoTakeoutManager {
  private readonly companionFinder: CompanionFinder;
  private readonly metadataResolver: MostRelevantMetadataResolver;
  private readonly metadataRestorer: NonDestructiveMetadataRestorer;

  constructor(configuration: Configuration) {
    const fileWriter = new FileWriter(configuration)
    const googlePhotoMetadataReader = new GooglePhotoMetadataReader()
    const exifReader = new ExifMetadataReader()
    const exifWriter = new ExifMetadataWriter()
    const cryptography = new Cryptography()

    this.companionFinder = new CompanionFinder(configuration, fileWriter)
    this.metadataResolver = new MostRelevantMetadataResolver(
      configuration,
      googlePhotoMetadataReader,
      exifReader,
      cryptography
    )
    this.metadataRestorer = new NonDestructiveMetadataRestorer(
      configuration,
      exifReader,
      exifWriter
    )
  }

  async execute() {
    const takeoutFiles = await this.companionFinder.scanInputDirectory()
    console.log("Takeout Files Count", takeoutFiles.length)
    const mediaFiles = await this.metadataResolver.mergeMetadataAndDuplicates(takeoutFiles)
    console.log("Media Files Count", mediaFiles.length)
    await this.metadataRestorer.copyAndRestore(mediaFiles)
  }
}