import { existsSync } from "fs";
import { basename, dirname, extname, resolve } from "path";

export function findCompanionFilePath(mediaFilePath: string): string | undefined {
  const directoryPath = dirname(mediaFilePath);
  const mediaFileExtension = extname(mediaFilePath);
  const mediaFileName = basename(mediaFilePath);
  let mediaFileNameWithoutExtension = basename(mediaFilePath, mediaFileExtension);

  // Sometimes (if the photo has been edited inside Google Photos) we get files with a `-edited` suffix
  // These images don't have their own .json sidecars - for these we'd want to use the JSON sidecar for the original image
  // so we can ignore the "-edited" suffix if there is one
  mediaFileNameWithoutExtension = mediaFileNameWithoutExtension.replace(/[-]modifié$/i, '');

  const potentialJsonFileNames: string[] = [
    `${mediaFileNameWithoutExtension}.json`,
    `${mediaFileNameWithoutExtension}..json`,
    `${mediaFileNameWithoutExtension}.j.json`,
    `${mediaFileNameWithoutExtension}.jp.json`,
    `${mediaFileNameWithoutExtension}.jpe.json`,
    `${mediaFileNameWithoutExtension}.jpg.json`,
    `${mediaFileNameWithoutExtension}${mediaFileExtension}.json`,
    `${mediaFileNameWithoutExtension.replace(/_[a-zA-Z]$/i, '_')}.json`,
    `${mediaFileNameWithoutExtension.replace(/-\d$/i, '-')}.json`,
    `${mediaFileNameWithoutExtension.slice(0, -1)}.json`,
  ]

  const nameWithCounterMatch = mediaFileNameWithoutExtension.match(/(?<name>.*)(?<counter>\(\d+\))$/);
  if (nameWithCounterMatch) {
    const name = nameWithCounterMatch?.groups?.['name'];
    const counter = nameWithCounterMatch?.groups?.['counter'];
    potentialJsonFileNames.push(`${name}${mediaFileExtension}${counter}.json`);
    potentialJsonFileNames.push(`${name?.slice(0, -1)}${counter}.json`);
    potentialJsonFileNames.push(`${name?.replace(/_[a-zA-Z]$/i, '_')}.json`)
    potentialJsonFileNames.push(`${name?.replace(/-\d$/i, '-')}.json`)
    potentialJsonFileNames.push(`${name?.slice(0, -1)}.json`)
    potentialJsonFileNames.push(`${name}.jpg${counter}.json`);
  }

  const nameWithEditedAndCounterMatch = mediaFileNameWithoutExtension.match(/(?<name>.*)-modifié(?<counter>\(\d\))$/)
  if (nameWithEditedAndCounterMatch) {
    const name = nameWithEditedAndCounterMatch?.groups?.['name'];
    const counter = nameWithEditedAndCounterMatch?.groups?.['counter'];
    potentialJsonFileNames.push(`${name}.jpg${counter}.json`);
  }

  // Sometimes the media filename ends with extra dash (eg. filename_n-.jpg + filename_n.json)
  const endsWithExtraDash = mediaFileNameWithoutExtension.endsWith('_n-');

  // Sometimes the media filename ends with extra `n` char (eg. filename_n.jpg + filename_.json)
  const endsWithExtraNChar = mediaFileNameWithoutExtension.endsWith('_n');

  // And sometimes the media filename has extra underscore in it (e.g. filename_.jpg + filename.json)
  const endsWithExtraUnderscore = mediaFileNameWithoutExtension.endsWith('_');

  if (endsWithExtraDash || endsWithExtraNChar || endsWithExtraUnderscore) {
    // We need to remove that extra char at the end
    potentialJsonFileNames.push(`${mediaFileNameWithoutExtension.slice(0, -1)}.json`);
  }


  // Now look to see if we have a JSON file in the same directory as the image for any of the potential JSON file names
  // that we identified earlier
  for (const potentialJsonFileName of potentialJsonFileNames) {
    const jsonFilePath = resolve(directoryPath, potentialJsonFileName);
    if (existsSync(jsonFilePath)) {
      return jsonFilePath;
    }
  }
}