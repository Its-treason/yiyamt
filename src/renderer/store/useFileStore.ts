import create from 'zustand';
import produce from 'immer';
import AbstractAction from '../editFiles/actions/AbstractAction';
import { File } from '../types';

type State = {
  files: File[];
  undoHistory: AbstractAction[];
  redoHistory: AbstractAction[];
  addAction: (action: AbstractAction) => void;
  undoAction: () => void;
  redoAction: () => void;
};

const useFileStore = create<State>((set) => ({
  files: [],
  undoHistory: [],
  redoHistory: [],
  addAction: (action: AbstractAction) => {
    set(
      produce((state: State) => {
        state.redoHistory = [];

        state.undoHistory.push(action);

        state.files = action.apply(state.files);
      })
    );
  },
  undoAction: () => {
    set(
      produce((state: State) => {
        const action = state.undoHistory.pop();

        if (!action) {
          return;
        }

        state.files = action.revert(state.files);
        state.redoHistory.push(action);
      })
    );
  },
  redoAction: () => {
    set(
      produce((state: State) => {
        const action = state.redoHistory.pop();
        if (!action) {
          return;
        }

        state.files = action.apply(state.files);
        state.undoHistory.push(action);
      })
    );
  },
}));

export default useFileStore;
