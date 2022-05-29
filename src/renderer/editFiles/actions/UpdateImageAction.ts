import AbstractAction from './AbstractAction';
import { File, Tag, Tags } from '../../types';

export default class UpdateImageAction extends AbstractAction {
  private fileId: string;

  private imageHash?: string;

  private oldImageHash?: string;

  constructor(fileId: string, imageHash?: string, oldImageHash?: string) {
    super();
    this.fileId = fileId;
    this.imageHash = imageHash;
    this.oldImageHash = oldImageHash;
  }

  public apply(files: File[]): File[] {
    const index = files.findIndex((file) => file.id === this.fileId);
    if (index === -1) {
      return files;
    }

    files[index].image = this.imageHash;

    return files;
  }

  public revert(files: File[]): File[] {
    const index = files.findIndex((file) => file.id === this.fileId);
    if (index === -1) {
      return files;
    }

    files[index].image = this.oldImageHash;

    return files;
  }
}
