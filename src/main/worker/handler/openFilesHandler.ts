import { File, IRPCMethodParams } from '../../types';
import fileHandlerFactory from '../fileHandler/fileHandlerFactory';

type OpenedFile = {
  path: string;
  mimeType: string;
};

export default async function openFilesHandler(params: IRPCMethodParams) {
  const files = params[0] as OpenedFile[];
  const newFiles: File[] = [];

  for (const file of files) {
    const handler = fileHandlerFactory(file.mimeType);
    if (!handler) {
      continue;
    }

    try {
      newFiles.push(await handler.readFile(file.path));
    } catch (e) {
      console.log(e);
      continue;
    }
  }

  return newFiles;
}
