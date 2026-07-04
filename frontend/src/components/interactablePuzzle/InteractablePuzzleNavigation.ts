import * as React from 'react';
const { useState } = React;

import { ClueDirection, PuzzleSquareWithClues, } from "../crosswordGrid/CrosswordGridTypes";
import { InteractablePuzzleFocusedState, InteractablePuzzleFocusState, } from "./InteractablePuzzleTypes";
import { whenFocused, isValidProposedFocusedStateFromArray, } from "./InteractablePuzzleNavigationUtils";

type InteractablePuzzleNavigationActions = {
  /**
   * Toggle the direction of the focus.
   */
  toggleDirection: () => void,

  /**
   * Navigate to a specific cell (if allowed).
   */
  navigateToCellIdxes: () => void,
};

const DEFAULT_FOCUS_STATE = { rowIdx: 0, colIdx: 0, direction: ClueDirection.ACROSS, clueNumber: 1 };

/**
 * Hook for navigation of the `InteractablePuzzle` component.
 */
function useInteractablePuzzleNavigation(puzzleSquareWithCluesArray: PuzzleSquareWithClues[][])
  : { focusState: InteractablePuzzleFocusState, actions: InteractablePuzzleNavigationActions } {
  const [focusState, setFocusState] = useState<InteractablePuzzleFocusState>(DEFAULT_FOCUS_STATE);

  // Reused helpers that requre scoped variables

  const asCallback = (action: (...args: any[]) => React.SetStateAction<InteractablePuzzleFocusState>) =>
    (...args: any[]) => {
      setFocusState(action(args));
    };
  const withProposedFocusedState =
    (f: InteractablePuzzleFocusedState, fallbackState: InteractablePuzzleFocusState) => {
      return isValidProposedFocusedStateFromArray(puzzleSquareWithCluesArray, f) ? f : fallbackState;
    };

  // Navigation actions

  const toggleDirection = () => whenFocused((f: InteractablePuzzleFocusedState) => {
    const proposedDirection = f.direction === ClueDirection.ACROSS
      ? ClueDirection.DOWN
      : ClueDirection.ACROSS;

    return withProposedFocusedState({ ...f, direction: proposedDirection }, f);
  });

  const navigateToCellIdxes = () => (f: InteractablePuzzleFocusState) => {

  }

  return {
    focusState,
    actions: {
      toggleDirection: asCallback(toggleDirection),
    },
  };
}

export {
  useInteractablePuzzleNavigation,
}
