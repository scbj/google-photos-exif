import { promises as fsPromises } from 'fs'

const { readFile } = fsPromises

interface RawGeoData {
  latitude: number;
  longitude: number;
  altitude: number;
  latitudeSpan: number;
  longitudeSpan: number;
}

interface RawGoogleTimestamp {
  timestamp: string;
  formatted: string;
}

interface RawGooglePhotoMetadata {
  title: string;
  description: string;
  imageViews: string;
  creationTime: RawGoogleTimestamp;
  modificationTime: RawGoogleTimestamp;
  geoData: RawGeoData;
  geoDataExif: RawGeoData;
  photoTakenTime: RawGoogleTimestamp;
  favorited: boolean;
}

export interface GooglePhotoMetadata {
  creationDate: Date
  geographicCoordinate?: {
    latitude: number;
    longitude: number;
  }
  name: string
}

export class GooglePhotoMetadataReader {
  async read(companionFilePath: string): Promise<GooglePhotoMetadata> {
    const json = await readFile(companionFilePath, 'utf8')
    const data = JSON.parse(json) as RawGooglePhotoMetadata
    const photoTakenTimestamp = parseInt(data.photoTakenTime.timestamp, 10)
    const photoTakenDate = new Date(photoTakenTimestamp * 1000)
    const exifGeographicCoordinate = this.parseGeographicCoordinate(data.geoDataExif)
    const googlePhotoGeographicCoordinate = this.parseGeographicCoordinate(data.geoData)

    return {
      creationDate: photoTakenDate,
      geographicCoordinate: exifGeographicCoordinate ?? googlePhotoGeographicCoordinate ?? undefined,
      name: data.title
    }
  }

  private parseGeographicCoordinate(geoData: RawGeoData) {
    if (
      !geoData.altitude
      && !geoData.latitude
      && !geoData.latitudeSpan
      && !geoData.longitude
      && !geoData.longitudeSpan
    ) return null

    return {
      latitude: geoData.latitude,
      longitude: geoData.longitude
    }
  }
}