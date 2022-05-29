import AbstractAction from './AbstractAction';
import { File, Tags } from '../../types';

export default class ValueAddAction extends AbstractAction {
  private fileId: string;

  private key: keyof Tags;

  constructor(fileId: string, key: keyof Tags) {
    super();
    this.fileId = fileId;
    this.key = key;
  }

  public apply(files: File[]): File[] {
    const index = files.findIndex((file) => file.id === this.fileId);
    if (index === -1) {
      return files;
    }

    if (!files[index].tags[this.key]) {
      files[index].tags[this.key] = { allowMultipleValues: true, values: [] };
    }
    files[index].tags[this.key].values.push('');

    return files;
  }

  public revert(files: File[]): File[] {
    const index = files.findIndex((file) => file.id === this.fileId);
    if (index === -1) {
      return files;
    }

    files[index].tags[this.key].values.pop();

    return files;
  }
}
