/* eslint no-bitwise: 0 */
import fs from 'node:fs';
import filetype from 'magic-bytes.js';
import imageSize from 'image-size';

const formatVorbisComment = (vendorString: string, commentList: string[]) => {
  const bufferArray = [];
  const vendorStringBuffer = Buffer.from(vendorString, 'utf8');
  const vendorLengthBuffer = Buffer.alloc(4);
  vendorLengthBuffer.writeUInt32LE(vendorStringBuffer.length);

  const userCommentListLengthBuffer = Buffer.alloc(4);
  userCommentListLengthBuffer.writeUInt32LE(commentList.length);

  bufferArray.push(
    vendorLengthBuffer,
    vendorStringBuffer,
    userCommentListLengthBuffer
  );

  for (let i = 0; i < commentList.length; i++) {
    const comment = commentList[i];
    const commentBuffer = Buffer.from(comment, 'utf8');
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(commentBuffer.length);
    bufferArray.push(lengthBuffer, commentBuffer);
  }

  return Buffer.concat(bufferArray);
};

const STREAMINFO = 0;
const PADDING = 1;
const APPLICATION = 2;
const SEEKTABLE = 3;
const VORBIS_COMMENT = 4;
const CUESHEET = 5;
const PICTURE = 6;

type ImageSpec = {
  type: number;
  mime: string;
  description: string;
  width: number;
  height: number;
  depth: number;
  colors: number;
};

class Metaflac {
  private flac: string | Buffer;

  private buffer: Buffer;

  private streamInfo: Buffer;

  private blocks: [number, Buffer][];

  private padding: Buffer;

  private vorbisComment: Buffer;

  private vendorString: string;

  private tags: string[];

  private pictures: Buffer[];

  private picturesSpecs: ImageSpec[];

  private picturesDatas: Buffer[];

  private framesOffset: number;

  constructor(flac: string | Buffer) {
    if (typeof flac !== 'string' && !Buffer.isBuffer(flac)) {
      throw new Error('Metaflac(flac) flac must be string or buffer.');
    }
    this.flac = flac;
    this.streamInfo = Buffer.alloc(0);
    this.blocks = [];
    this.padding = Buffer.alloc(0);
    this.vorbisComment = Buffer.alloc(0);
    this.vendorString = '';
    this.tags = [];
    this.pictures = [];
    this.picturesSpecs = [];
    this.picturesDatas = [];
    this.framesOffset = 0;

    this.buffer =
      typeof this.flac === 'string' ? fs.readFileSync(this.flac) : this.flac;

    let offset = 0;
    const marker = this.buffer.slice(0, (offset += 4)).toString('ascii');
    if (marker !== 'fLaC') {
      throw new Error('The file does not appear to be a FLAC file.');
    }

    let blockType = 0;
    let isLastBlock = false;
    while (!isLastBlock) {
      blockType = this.buffer.readUInt8(offset++);
      isLastBlock = blockType > 128;
      blockType %= 128;

      const blockLength = this.buffer.readUIntBE(offset, 3);
      offset += 3;

      if (blockType === STREAMINFO) {
        this.streamInfo = this.buffer.slice(offset, offset + blockLength);
      }

      if (blockType === PADDING) {
        this.padding = this.buffer.slice(offset, offset + blockLength);
      }

      if (blockType === VORBIS_COMMENT) {
        this.vorbisComment = this.buffer.slice(offset, offset + blockLength);
        this.parseVorbisComment();
      }

      if (blockType === PICTURE) {
        this.pictures.push(this.buffer.slice(offset, offset + blockLength));
        this.parsePictureBlock();
      }

      if ([APPLICATION, SEEKTABLE, CUESHEET].includes(blockType)) {
        this.blocks.push([
          blockType,
          this.buffer.slice(offset, offset + blockLength),
        ]);
      }
      offset += blockLength;
    }
    this.framesOffset = offset;
  }

  private parseVorbisComment() {
    const vendorLength = this.vorbisComment.readUInt32LE(0);
    this.vendorString = this.vorbisComment
      .slice(4, vendorLength + 4)
      .toString('utf8');
    this.vorbisComment.readUInt32LE(4 + vendorLength);
    const userCommentListBuffer = this.vorbisComment.slice(
      4 + vendorLength + 4
    );
    for (let offset = 0; offset < userCommentListBuffer.length; ) {
      const length = userCommentListBuffer.readUInt32LE(offset);
      offset += 4;
      const comment = userCommentListBuffer
        .slice(offset, (offset += length))
        .toString('utf8');
      this.tags.push(comment);
    }
  }

  private parsePictureBlock() {
    this.pictures.forEach((picture) => {
      let offset = 0;
      const type = picture.readUInt32BE(offset);
      offset += 4;
      const mimeTypeLength = picture.readUInt32BE(offset);
      offset += 4;
      const mime = picture
        .slice(offset, offset + mimeTypeLength)
        .toString('ascii');
      offset += mimeTypeLength;
      const descriptionLength = picture.readUInt32BE(offset);
      offset += 4;
      const description = picture
        .slice(offset, (offset += descriptionLength))
        .toString('utf8');
      const width = picture.readUInt32BE(offset);
      offset += 4;
      const height = picture.readUInt32BE(offset);
      offset += 4;
      const depth = picture.readUInt32BE(offset);
      offset += 4;
      const colors = picture.readUInt32BE(offset);
      offset += 4;
      const pictureDataLength = picture.readUInt32BE(offset);
      offset += 4;
      this.picturesDatas.push(
        picture.slice(offset, offset + pictureDataLength)
      );
      this.picturesSpecs.push(
        this.buildSpecification({
          type,
          mime,
          description,
          width,
          height,
          depth,
          colors,
        })
      );
    });
  }

  public getPicturesSpecs() {
    return this.picturesSpecs;
  }

  /**
   * Get the MD5 signature from the STREAMINFO block.
   */
  public getMd5sum() {
    return this.streamInfo.slice(18, 34).toString('hex');
  }

  /**
   * Get the minimum block size from the STREAMINFO block.
   */
  public getMinBlocksize() {
    return this.streamInfo.readUInt16BE(0);
  }

  /**
   * Get the maximum block size from the STREAMINFO block.
   */
  public getMaxBlocksize() {
    return this.streamInfo.readUInt16BE(2);
  }

  /**
   * Get the minimum frame size from the STREAMINFO block.
   */
  public getMinFramesize() {
    return this.streamInfo.readUIntBE(4, 3);
  }

  /**
   * Get the maximum frame size from the STREAMINFO block.
   */
  public getMaxFramesize() {
    return this.streamInfo.readUIntBE(7, 3);
  }

  /**
   * Get the sample rate from the STREAMINFO block.
   */
  public getSampleRate(): number {
    // 20 bits number
    return this.streamInfo.readUIntBE(10, 3) >> 4;
  }

  /**
   * Get the number of channels from the STREAMINFO block.
   */
  public getChannels() {
    // 3 bits
    return this.streamInfo.readUIntBE(10, 3) & (0x00000f >> 1);
  }

  /**
   * Get the # of bits per sample from the STREAMINFO block.
   */
  public getBps() {
    return this.streamInfo.readUIntBE(12, 2) & (0x01f0 >> 4);
  }

  /**
   * Get the total # of samples from the STREAMINFO block.
   */
  public getTotalSamples() {
    return this.streamInfo.readUIntBE(13, 5) & 0x0fffffffff;
  }

  /**
   * Show the vendor string from the VORBIS_COMMENT block.
   */
  public getVendorTag() {
    return this.vendorString;
  }

  public getPictureData(): Buffer[] {
    return this.picturesDatas;
  }

  /**
   * Get all tags where the the field name matches NAME.
   *
   * @param {string} name
   */
  public getTag(name: string) {
    return this.tags
      .filter((item) => {
        const itemName = item.split('=')[0];
        return itemName === name;
      })
      .join('\n');
  }

  /**
   * Remove all tags whose field name is NAME.
   *
   * @param {string} name
   */
  public removeTag(name: string) {
    this.tags = this.tags.filter((item) => {
      const itemName = item.split('=')[0];
      return itemName !== name;
    });
  }

  /**
   * Remove first tag whose field name is NAME.
   *
   * @param {string} name
   */
  public removeFirstTag(name: string) {
    const found = this.tags.findIndex((item) => {
      return item.split('=')[0] === name;
    });
    if (found !== -1) {
      this.tags.splice(found, 1);
    }
  }

  /**
   * Remove all tags, leaving only the vendor string.
   */
  public removeAllTags(): void {
    this.tags = [];
  }

  /**
   * Add a tag.
   * The FIELD must comply with the Vorbis comment spec, of the form NAME=VALUE. If there is currently no tag block, one will be created.
   *
   * @param {string} field
   */
  public addTag(field: string) {
    if (field.indexOf('=') === -1) {
      throw new Error(
        `malformed vorbis comment field "${field}", field contains no '=' character`
      );
    }
    this.tags.push(field);
  }

  /**
   * Like addTag, except the VALUE is a filename whose contents will be read verbatim to set the tag value.
   *
   * @param {string} field
   */
  public setTagFromFile(field: string): void {
    const position = field.indexOf('=');
    if (position === -1) {
      throw new Error(
        `malformed vorbis comment field "${field}", field contains no '=' character`
      );
    }
    const name = field.substring(0, position);
    const filename = field.substr(position + 1);
    let value;
    try {
      value = fs.readFileSync(filename, 'utf8');
    } catch (e) {
      throw new Error(`can't open file '${filename}' for '${name}' tag value`);
    }
    this.tags.push(`${name}=${value}`);
  }

  /**
   * Import tags from a file.
   * Each line should be of the form NAME=VALUE.
   *
   * @param {string} filename
   */
  public importTagsFrom(filename: string): void {
    const tags = fs.readFileSync(filename, 'utf8').split('\n');
    tags.forEach((line) => {
      if (line.indexOf('=') === -1) {
        throw new Error(
          `malformed vorbis comment "${line}", contains no '=' character`
        );
      }
    });
    this.tags = this.tags.concat(tags);
  }

  /**
   * Export tags to a file.
   * Each line will be of the form NAME=VALUE.
   *
   * @param {string} filename
   */
  public exportTagsTo(filename: string): void {
    fs.writeFileSync(filename, this.tags.join('\n'), 'utf8');
  }

  /**
   * Import a picture and store it in a PICTURE metadata block.
   *
   * @param {string} filename
   */
  public importPictureFrom(filename: string): void {
    const picture = fs.readFileSync(filename);
    const { mime } = filetype(picture)[0];
    if (mime !== 'image/jpeg' && mime !== 'image/png' && mime !== 'image/gif') {
      throw new Error(
        `Only support image/jpeg, image/png & image/gif picture, current import ${mime}`
      );
    }
    const dimensions = imageSize(filename);
    const spec = this.buildSpecification({
      mime,
      width: dimensions.width,
      height: dimensions.height,
    });
    this.pictures.push(this.buildPictureBlock(picture, spec));
    this.picturesSpecs.push(spec);
  }

  /**
   * Import a picture and store it in a PICTURE metadata block.
   *
   * @param {Buffer} picture
   */
  public importPictureFromBuffer(picture: Buffer) {
    const { mime } = filetype(picture)[0];
    if (mime !== 'image/jpeg' && mime !== 'image/png' && mime !== 'image/gif') {
      throw new Error(
        `Only support image/jpeg, image/png & image/gif picture, current import ${mime}`
      );
    }
    const dimensions = imageSize(picture);
    const spec = this.buildSpecification({
      mime,
      width: dimensions.width,
      height: dimensions.height,
    });
    this.pictures.push(this.buildPictureBlock(picture, spec));
    this.picturesSpecs.push(spec);
  }

  /**
   * Export PICTURE block to a file.
   *
   * @param {string} filename
   */
  public exportPictureTo(filename: string) {
    if (this.picturesDatas.length > 0) {
      fs.writeFileSync(filename, this.picturesDatas[0]);
    }
  }

  /**
   * Return all tags.
   */
  public getAllTags() {
    return this.tags;
  }

  public buildSpecification(spec = {}) {
    const defaults = {
      type: 3,
      mime: 'image/jpeg',
      description: '',
      width: 0,
      height: 0,
      depth: 24,
      colors: 0,
    };
    return Object.assign(defaults, spec);
  }

  /**
   * Build a picture block.
   *
   * @param {Buffer} picture
   * @param {Object} specification
   * @returns {Buffer}
   */
  public buildPictureBlock(picture: Buffer, specification: ImageSpec): Buffer {
    const pictureType = Buffer.alloc(4);
    const mimeLength = Buffer.alloc(4);
    const mime = Buffer.from(specification.mime, 'ascii');
    const descriptionLength = Buffer.alloc(4);
    const description = Buffer.from(specification.description, 'utf8');
    const width = Buffer.alloc(4);
    const height = Buffer.alloc(4);
    const depth = Buffer.alloc(4);
    const colors = Buffer.alloc(4);
    const pictureLength = Buffer.alloc(4);

    pictureType.writeUInt32BE(specification.type);
    mimeLength.writeUInt32BE(specification.mime.length);
    descriptionLength.writeUInt32BE(specification.description.length);
    width.writeUInt32BE(specification.width);
    height.writeUInt32BE(specification.height);
    depth.writeUInt32BE(specification.depth);
    colors.writeUInt32BE(specification.colors);
    pictureLength.writeUInt32BE(picture.length);

    return Buffer.concat([
      pictureType,
      mimeLength,
      mime,
      descriptionLength,
      description,
      width,
      height,
      depth,
      colors,
      pictureLength,
      picture,
    ]);
  }

  private buildMetadataBlock(type: number, block: Buffer, isLast = false) {
    const header = Buffer.alloc(4);
    if (isLast) {
      // eslint-disable-next-line no-param-reassign
      type += 128;
    }
    header.writeUIntBE(type, 0, 1);
    header.writeUIntBE(block.length, 1, 3);
    return Buffer.concat([header, block]);
  }

  private buildMetadata() {
    const bufferArray = [];
    bufferArray.push(this.buildMetadataBlock(STREAMINFO, this.streamInfo));
    this.blocks.forEach((block) => {
      bufferArray.push(this.buildMetadataBlock(...block));
    });
    bufferArray.push(
      this.buildMetadataBlock(
        VORBIS_COMMENT,
        formatVorbisComment(this.vendorString, this.tags)
      )
    );
    this.pictures.forEach((block) => {
      bufferArray.push(this.buildMetadataBlock(PICTURE, block));
    });
    bufferArray.push(this.buildMetadataBlock(PADDING, this.padding, true));
    return bufferArray;
  }

  private buildStream() {
    const metadata = this.buildMetadata();
    return [
      this.buffer.slice(0, 4),
      ...metadata,
      this.buffer.slice(this.framesOffset),
    ];
  }

  /**
   * Save change to file or return changed buffer.
   */
  public save(): Buffer | void {
    if (typeof this.flac === 'string') {
      return fs.writeFileSync(this.flac, Buffer.concat(this.buildStream()));
    }
    return Buffer.concat(this.buildStream());
  }
}

export default Metaflac;
