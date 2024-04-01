export interface GeographicCoordinate {
  latitude: number
}

export interface Metadata {
  creationDate: Date
  description?: string
  name: string
  geographicCoordinate?: GeographicCoordinate
}

export function mergeMetadataWithPriorityForTheFirst(first: Metadata, second: Metadata) {
  throw new Error('Not implemented')
}

export interface OutputFile {
  originalFilePath: string
  targetFilePath: string
  metadata: Metadata
}