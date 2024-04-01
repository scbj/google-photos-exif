type MediaFileExtension = `.${string}`

export interface Configuration {
  errorDirectory: string
  inputDirectory: string
  outputDirectory: string
  supportedMediaFileExtensions: MediaFileExtension[]
}