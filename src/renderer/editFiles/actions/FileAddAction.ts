import AbstractAction from './AbstractAction';
import { File } from '../../types';

export default class FileAddAction extends AbstractAction {
  private newFiles: File[];

  constructor(files: File[]) {
    super();
    this.newFiles = files;
  }

  public apply(files: File[]): File[] {
    files.push(...this.newFiles);
    return files;
  }

  public revert(files: File[]): File[] {
    const newFilesIds: string[] = this.newFiles.map((newFile) => newFile.id);

    return files.filter((file) => {
      return !newFilesIds.includes(file.id);
    });
  }
}
