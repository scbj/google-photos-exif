import { extname } from "path";
import { Configuration } from "../models/Configuration";
import { TakeoutFileInfo, MediaFileInfo } from "../models/File";
import { MediaFile } from "../models/MediaFile";
import { Metadata, OutputFile, mergeMetadataWithPriorityForTheFirst } from "../models/OutputFile";
import { Cryptography } from "./Cryptography";
import { ExifMetadata, ExifMetadataReader } from "./ExifMetadataReader";
import { GooglePhotoMetadata, GooglePhotoMetadataReader } from "./GooglePhotoMetadataReader";

export class MostRelevantMetadataResolver {
  constructor(
    private readonly configuration: Configuration,
    private readonly googlePhotoMetadataReader: GooglePhotoMetadataReader,
    private readonly exifMetadataReader: ExifMetadataReader,
    private readonly cryptography: Cryptography
  ) {}
  
  async mergeMetadataAndDuplicates(takeoutFileInfos: TakeoutFileInfo[]): Promise<MediaFileInfo[]> {
    const uniqueMediaFileInfos = new Map<string, MediaFileInfo>()

    for (const takeoutFileInfo of takeoutFileInfos) {
      const hash = await this.cryptography.hashFile(takeoutFileInfo.mediaFilePath)
      const exifMetadata = await this.exifMetadataReader.read(takeoutFileInfo.mediaFilePath)
      const googlePhotoMetadata = await this.googlePhotoMetadataReader.read(takeoutFileInfo.companionFilePath)
      console.log(`🧠 Resolve metadata for ${takeoutFileInfo.mediaFilePath}`)
      const mediaFileInfo = this.createMediaFileInfo(takeoutFileInfo, exifMetadata, googlePhotoMetadata)
      
      const alreadyExistingMediaFileInfo = uniqueMediaFileInfos.get(hash)
      if (alreadyExistingMediaFileInfo && alreadyExistingMediaFileInfo.creationDate < mediaFileInfo.creationDate)
        continue
      
      uniqueMediaFileInfos.set(hash, mediaFileInfo)
    }
    return Array.from(uniqueMediaFileInfos.values())
  }

  private createMediaFileInfo(takeoutFileInfo: TakeoutFileInfo, exifInfos: ExifMetadata | null, googlePhotoMetadata: GooglePhotoMetadata): MediaFileInfo {
    const creationDate = exifInfos?.creationDate ?? googlePhotoMetadata.creationDate
    const geographicCoordinate = exifInfos?.geographicCoordinate ?? googlePhotoMetadata.geographicCoordinate
    const path = takeoutFileInfo.mediaFilePath
    const extension = extname(path)

    return {
      creationDate,
      extension,
      geographicCoordinate,
      name: googlePhotoMetadata.name,
      path
    }
  }
}