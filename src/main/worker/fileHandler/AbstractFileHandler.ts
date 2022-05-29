import { File, Tag } from '../../types';

export default abstract class AbstractFileHandler {
  public abstract readFile(path: string): Promise<File> | never;

  public abstract writeFile(file: File): Promise<void>;

  protected createTag(value: string | string[]): Tag {
    if (typeof value === 'string') {
      return { values: [value], allowMultipleValues: false };
    }
    return { values: value, allowMultipleValues: true };
  }
}
