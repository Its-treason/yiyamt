import NodeID3 from 'node-id3';
import { basename } from 'node:path';
import { createHash } from 'node:crypto';
import filetype from 'magic-bytes.js';
import generateRandomString from '../util/generateRandomString';
import { File, Tags } from '../../types';
import AbstractFileHandler from './AbstractFileHandler';
import ImageRepository from '../ImageRepository';

export default class Mp3FileHandler extends AbstractFileHandler {
  public static readonly TYPE = 'mp3';

  public async readFile(path: string): Promise<File> {
    const rawTags = NodeID3.read(path);

    const [discNumber, totalDiscs] = this.splitTrackNumbers(
      rawTags.partOfSet || ''
    );
    const [trackNumber, totalTracks] = this.splitTrackNumbers(
      rawTags.trackNumber || ''
    );

    let imageHash;
    let image;
    if (typeof rawTags.image === 'object') {
      image = rawTags.image.imageBuffer;

      const hashSum = createHash('md5');
      hashSum.update(image);
      imageHash = hashSum.digest('hex');

      ImageRepository.getInstance().set(imageHash, image);
    }

    const tags: Tags = {
      album: this.createTag(rawTags.album || ''),
      albumArtist: this.createTag(rawTags.performerInfo || ''),
      artist: this.createTag(this.splitTagValue(rawTags.artist || '')),
      copyright: this.createTag(rawTags.copyright || ''),
      discNumber: this.createTag(discNumber || ''),
      totalDiscs: this.createTag(totalDiscs || ''),
      genre: this.createTag(rawTags.genre || ''),
      license: this.createTag(rawTags.fileOwner || ''),
      title: this.createTag(rawTags.title || ''),
      trackNumber: this.createTag(trackNumber || ''),
      totalTracks: this.createTag(totalTracks || ''),
    };

    return {
      id: generateRandomString(12),
      filePath: path,
      newFileName: null,
      filename: basename(path),
      type: Mp3FileHandler.TYPE,
      image: imageHash,
      tags,
    };
  }

  private splitTagValue(value: string): string[] {
    return value
      .split('/')
      .filter((splittedTag) => splittedTag.trim().length > 0);
  }

  /*
    Splits the TPOS & TRCK fields. These are either 'Number' without a total number of tracks or 'Number/Number'
  */
  private splitTrackNumbers(value: string): [string | null, string | null] {
    let [trackNumber, totalTracks]: (string | null)[] = value.split('/');
    if (trackNumber.trim().length === 0) {
      trackNumber = null;
    }
    if (!totalTracks || totalTracks.trim().length === 0) {
      totalTracks = null;
    }
    return [trackNumber, totalTracks];
  }

  public async writeFile(file: File): Promise<void> {
    const newTags: NodeID3.Tags = {
      album: this.validateTag(file.tags.album.values[0]),
      performerInfo: this.validateTag(file.tags.albumArtist.values[0]),
      artist: this.joinMultiValue(file.tags.artist.values),
      copyright: this.validateTag(file.tags.copyright.values[0]),
      partOfSet: this.joinTrackNumbers(
        file.tags.discNumber.values[0],
        file.tags.totalDiscs.values[0]
      ),
      trackNumber: this.joinTrackNumbers(
        file.tags.trackNumber.values[0],
        file.tags.totalTracks.values[0]
      ),
      genre: this.validateTag(file.tags.genre.values[0]),
      fileOwner: this.validateTag(file.tags.license.values[0]),
      title: this.validateTag(file.tags.title.values[0]),
    };

    if (file.image) {
      const imageBuffer = ImageRepository.getInstance().get(file.image);
      if (imageBuffer) {
        newTags.image = {
          imageBuffer,
          mime: filetype(imageBuffer)[0].mime || '',
          description: 'front cover',
          type: {
            id: 3,
            name: 'front cover',
          },
        };
      }
    }

    NodeID3.update(newTags, file.filePath);
  }

  private validateTag(value: string): string | undefined {
    if (value.trim().length === 0) {
      return undefined;
    }
    return value.trim();
  }

  private joinTrackNumbers(
    trackNumber: string,
    totalTracks: string
  ): string | undefined {
    if (trackNumber.trim().length === 0) {
      return undefined;
    }
    let joined = trackNumber.trim();
    if (totalTracks.trim().length !== 0) {
      joined += `/${totalTracks.trim()}`;
    }
    return joined;
  }

  private joinMultiValue(values: string[]): string | undefined {
    const filteredValues = values.reduce<string[]>((acc, value) => {
      if (value.trim().length !== 0) {
        acc.push(value.trim());
      }
      return acc;
    }, []);

    if (filteredValues.length === 0) {
      return undefined;
    }
    return filteredValues.join('/');
  }
}
