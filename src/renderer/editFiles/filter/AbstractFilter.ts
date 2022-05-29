import { File } from '../../types';

export default abstract class AbstractFilter {
  public abstract filter(files: File[]): File[];
}
