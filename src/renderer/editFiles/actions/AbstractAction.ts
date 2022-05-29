import { File } from '../../types';

export default abstract class AbstractAction {
  public abstract apply(files: File[]): File[];
  public abstract revert(files: File[]): File[];
}
