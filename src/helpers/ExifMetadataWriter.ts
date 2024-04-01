import { exiftool } from 'exiftool-vendored'
import { promises as fsPromises } from 'fs';

const { unlink } = fsPromises;

interface ExifMetadata {
  creationDate?: Date
  geographicCoordinate?: {
    latitude: number
    longitude: number
  }
}

export class ExifMetadataWriter {
  async write(filePath: string, metadata: ExifMetadata) {
    if (metadata.creationDate)
      await exiftool.write(filePath, {
        DateTimeOriginal: metadata.creationDate.toISOString()
      })
    console.log("🍄 ~ ExifMetadataWriter ~ write ~ metadata.geographicCoordinate:", metadata.geographicCoordinate)
    if (metadata.geographicCoordinate) {
      console.log('Writing GPS')
      await exiftool.write(filePath, {
        GPSLatitude: 0,
        GPSLongitude: 0,
      })
    }

    await unlink(`${filePath}_original`)
  }
}