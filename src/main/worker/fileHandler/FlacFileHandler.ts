import { basename } from 'node:path';
import { createHash } from 'node:crypto';
import Metaflac from '../lib/metaflac';
import AbstractFileHandler from './AbstractFileHandler';
import { File, Tags } from '../../types';
import generateRandomString from '../util/generateRandomString';
import ImageRepository from '../ImageRepository';

export default class FlacFileHandler extends AbstractFileHandler {
  public static readonly TYPE = 'flac';

  private readonly tagNameMap: { [key: string]: string } = {
    artist: 'ARTIST',
    albumArtist: 'ALBUMARTIST',
    copyright: 'COPYRIGHT',
    discNumber: 'DISCNUMBER',
    genre: 'GENRE',
    license: 'LICENSE',
    title: 'TITLE',
    trackNumber: 'TRACKNUMBER',
  };

  public async readFile(path: string): Promise<File> {
    const flac = new Metaflac(path);

    const tags = this.getTags(flac);

    let imageHash;
    let image;
    if (flac.getPictureData()[0]) {
      // eslint-disable-next-line prefer-destructuring
      image = flac.getPictureData()[0];

      const hashSum = createHash('md5');
      hashSum.update(image);
      imageHash = hashSum.digest('hex');

      ImageRepository.getInstance().set(imageHash, image);
    }

    return {
      id: generateRandomString(12),
      filePath: path,
      newFileName: null,
      filename: basename(path),
      type: FlacFileHandler.TYPE,
      image: imageHash,
      tags,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private getTags(flac: Metaflac): Tags {
    const tags: Tags = {
      title: this.createTag(''),
      artist: this.createTag([]),
      album: this.createTag(''),
      albumArtist: this.createTag(''),
      genre: this.createTag([]),
      trackNumber: this.createTag(''),
    };

    const rawTags = flac.getAllTags();
    rawTags.forEach((rawTag) => {
      const [tag, value] = rawTag.split('=');
      if (!tag.trim() || !value.trim()) {
        return;
      }

      switch (tag) {
        case 'ALBUM':
          tags.album = this.createTag(value);
          break;
        case 'ALBUMARTIST':
        case 'ALBUM ARTIST': // ALBUM ARTIST (with a space) was used by foobar2000
          tags.albumArtist = this.createTag(value);
          break;
        case 'ARTIST':
          tags.artist.values.push(value);
          break;
        case 'COPYRIGHT':
          tags.copyright = this.createTag(value);
          break;
        case 'DISCNUMBER':
          tags.discNumber = this.createTag(value);
          break;
        case 'GENRE':
          tags.genre.values.push(value);
          break;
        case 'LICENSE':
          tags.license = this.createTag(value);
          break;
        case 'TITLE':
          tags.title = this.createTag(value);
          break;
        case 'TRACKNUMBER':
          tags.trackNumber = this.createTag(value);
          break;
        default:
          tags[tag] = this.createTag(value);
          break;
      }
    });

    if (tags.artist.values.length === 0) {
      tags.artist.values.push('');
    }
    if (tags.genre.values.length === 0) {
      tags.genre.values.push('');
    }

    return tags;
  }

  public async writeFile(file: File): Promise<void> {
    const flac = new Metaflac(file.filePath);

    Object.entries(file.tags).forEach(([rawTagKey, tag]) => {
      const tagKey = this.tagNameMap[rawTagKey] || rawTagKey;

      const values = tag.values.reduce<string[]>((acc, value) => {
        if (value.trim().length !== 0) {
          acc.push(value.trim());
        }
        return acc;
      }, []);

      flac.removeTag(tagKey);

      values.forEach((value) => {
        flac.addTag(`${tagKey}=${value}`);
      });
      flac.save();
    });

    if (file.image) {
      const imageBuffer = ImageRepository.getInstance().get(file.image);

      if (!imageBuffer) {
        return;
      }
      flac.importPictureFromBuffer(imageBuffer);
    }
  }
}
