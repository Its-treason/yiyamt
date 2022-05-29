import AbstractAction from './AbstractAction';
import { File, Tags } from '../../types';

export default class ValueRemoveAction extends AbstractAction {
  private fileId: string;

  private key: keyof Tags;

  private indexToRemove: number;

  private removedValue: string = '';

  constructor(fileId: string, key: keyof Tags, indexToRemove: number) {
    super();
    this.fileId = fileId;
    this.key = key;
    this.indexToRemove = indexToRemove;
  }

  public apply(files: File[]): File[] {
    const index = files.findIndex((file) => file.id === this.fileId);
    if (index === -1) {
      return files;
    }

    const removedValues = files[index].tags[this.key].values.splice(
      this.indexToRemove,
      1
    );
    // eslint-disable-next-line prefer-destructuring
    this.removedValue = removedValues[0];

    return files;
  }

  public revert(files: File[]): File[] {
    const index = files.findIndex((file) => file.id === this.fileId);
    if (index === -1) {
      return files;
    }

    files[index].tags[this.key].values.splice(
      this.indexToRemove,
      0,
      this.removedValue
    );

    return files;
  }
}
