import { File, IRPCMethodParams } from '../../types';
import fileHandlerFactory from '../fileHandler/fileHandlerFactory';

export default async function saveFilesHandler(params: IRPCMethodParams) {
  const files = params[0] as File[];

  for (const file of files) {
    const handler = fileHandlerFactory(file.type);
    if (!handler) {
      continue;
    }

    try {
      await handler.writeFile(file);
    } catch {
      continue;
    }
  }

  return { saved: true };
}
