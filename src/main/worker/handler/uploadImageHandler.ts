import { readFileSync, statSync } from 'fs';
import filetype from 'magic-bytes.js';
import { createHash } from 'node:crypto';
import { ImageUploadResult, IRPCMethodParams } from '../../types';
import ImageRepository from '../ImageRepository';

const expectedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

export default async function uploadImageHandler(
  params: IRPCMethodParams
): Promise<ImageUploadResult> {
  const filePath = params[0] as string;

  const fileStats = statSync(filePath);
  // 1e7 -> 10MB
  if (fileStats.size > 1e7) {
    return {
      error:
        'Filesize exceeds 10MB! Using an large image will cause problem with players',
      imageHash: null,
    };
  }

  let imageBuffer: Buffer;
  try {
    imageBuffer = readFileSync(filePath);
  } catch {
    return { error: 'Could not open file', imageHash: null };
  }

  const type = filetype(imageBuffer);
  if (!expectedMimeTypes.includes(type[0].mime || '')) {
    const expectedTypes = expectedMimeTypes.join('", "');

    return {
      error: `
        File has wrong mime type! Expected one of "${expectedTypes}"
        but got "${type[0].mime || 'Unknown mime type'}"
      `,
      imageHash: null,
    };
  }

  const hashSum = createHash('md5');
  hashSum.update(imageBuffer);
  const imageHash = hashSum.digest('hex');

  ImageRepository.getInstance().set(imageHash, imageBuffer);

  return { imageHash, error: null };
}
