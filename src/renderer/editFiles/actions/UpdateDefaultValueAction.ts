import AbstractAction from './AbstractAction';
import { File, Tag, Tags } from '../../types';

export default class UpdateDefaultValueAction extends AbstractAction {
  private fileId: string;

  private key: keyof Tags;

  private oldValue: Tag;

  private newValue: Tag;

  constructor(fileId: string, key: keyof Tags, oldValue: Tag, newValue: Tag) {
    super();
    this.fileId = fileId;
    this.key = key;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }

  public apply(files: File[]): File[] {
    const index = files.findIndex((file) => file.id === this.fileId);
    if (index === -1) {
      return files;
    }

    files[index].tags[this.key] = this.newValue;

    return files;
  }

  public revert(files: File[]): File[] {
    const index = files.findIndex((file) => file.id === this.fileId);
    if (index === -1) {
      return files;
    }

    files[index].tags[this.key] = this.oldValue;

    return files;
  }
}
