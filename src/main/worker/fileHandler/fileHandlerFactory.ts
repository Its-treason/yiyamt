import AbstractFileHandler from './AbstractFileHandler';
import FlacFileHandler from './FlacFileHandler';
import Mp3FileHandler from './Mp3FileHandler';

function fileHandlerFactory(mimeType: string): AbstractFileHandler | null {
  switch (mimeType) {
    case 'audio/x-flac':
    case 'audio/flac':
    case FlacFileHandler.TYPE:
      return new FlacFileHandler();
    case 'audio/mpeg':
    case Mp3FileHandler.TYPE:
      return new Mp3FileHandler();
    default:
      return null;
  }
}

export default fileHandlerFactory;
