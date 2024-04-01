import { extname } from "path";
import { ExifDateTime, Tags, exiftool } from 'exiftool-vendored'

export interface ExifMetadata {
  creationDate?: Date
  geographicCoordinate?: {
    latitude: number
    longitude: number
  }
}

const supportedFileExtensions = [
  '.jpeg',
  '.jpg'
]

export class ExifMetadataReader {
  isSupported(filePath: string) {
    const extension = extname(filePath).toLowerCase()
    return supportedFileExtensions.includes(extension)
  }

  async read(filePath: string): Promise<ExifMetadata | null> {
    if (!this.isSupported(filePath)) return null

    const exifTags = await exiftool.read(filePath)
    if (exifTags.errors?.length) return null

    const creationDate = this.convertExifDateTimeToDate(exifTags.DateTimeOriginal)
    const geographicCoordinate = this.convertGpsTagsToGeographicCoordinate(exifTags)
    
    return {
      creationDate: creationDate ?? undefined,
      geographicCoordinate: geographicCoordinate ?? undefined
    }
  }
  
  private convertExifDateTimeToDate(exifDateTime?: string | ExifDateTime) {
    if (!exifDateTime) return null

    const date = exifDateTime instanceof ExifDateTime
      ? exifDateTime.toDate()
      : new Date(exifDateTime)
    if (date.toString() === 'Invalid Date') return null

    return date
  }

  private convertGpsTagsToGeographicCoordinate(tags: Tags) {
    const latitude = tags.GPSLatitude
    const longitude = tags.GPSLongitude
    if (!latitude || !longitude) return null

    return {
      latitude,
      longitude
    }
  }
}