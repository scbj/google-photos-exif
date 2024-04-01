export interface TakeoutFileInfo {
  mediaFilePath: string
  companionFilePath: string
}

export interface MediaFileInfo {
  creationDate: Date
  extension: string
  geographicCoordinate?: {
    latitude: number
    longitude: number
  }
  name: string
  path: string
}

export interface OutputFile {
  creationDate: Date
  description: string
  extension: string
  geographicCoordinate: {}
  name: string
  path: string
}