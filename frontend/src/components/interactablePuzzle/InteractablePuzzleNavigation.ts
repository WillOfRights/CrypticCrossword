import * as React from 'react';
const { useState } = React;

import { ClueDirection, PuzzleSquareWithClues, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { invertDirection, } from "../crosswordGrid/CrosswordGridUtils";

import { InteractablePuzzleFocus, InteractablePuzzleFocusedState, InteractablePuzzleFocusState, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";
import { deriveInteractablePuzzleFocus, whenFocused, isValidProposedFocusedStateFromArray, } from "./InteractablePuzzleNavigationUtils";

type InteractablePuzzleNavigationActions = {
  /**
   * Toggle the direction of the focus.
   */
  toggleDirection: () => void,

  /**
   * Navigate to a specific cell (if allowed). Optionally accepts a preferred direction, otherwise
   * prefers the current direction (if any exist) and otherwise the across direction.
   */
  navigateToCell: (rowIdx: number, colIdx: number, preferredDirection?: ClueDirection) => void,
};

const DEFAULT_FOCUS_STATE = { rowIdx: 0, colIdx: 0, direction: ClueDirection.ACROSS, };

/**
 * Hook for navigation of the `InteractablePuzzle` component.
 */
function useInteractablePuzzleNavigation(puzzleSquareWithCluesArray: PuzzleSquareWithClues[][])
  : { focus: InteractablePuzzleFocus, actions: InteractablePuzzleNavigationActions } {
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
  const withSoftRetryDirection =
    (f: InteractablePuzzleFocusedState, fallbackState: InteractablePuzzleFocusState) => {
      return withProposedFocusedState(f,
        withProposedFocusedState(
          { ...f, direction: invertDirection(f.direction) },
          fallbackState
        )
      );
    };

  // Navigation actions

  const toggleDirection = () => whenFocused((f: InteractablePuzzleFocusedState) => {
    return withProposedFocusedState({ ...f, direction: invertDirection(f.direction) }, f);
  });

  const navigateToCell = (rowIdx: number, colIdx: number, preferredDirection?: ClueDirection) =>
    (f: InteractablePuzzleFocusState) => {
      const proposedDirection = !!preferredDirection
        ? preferredDirection
        : f !== InteractablePuzzleUnfocused.NOT_FOCUSED
          ? f.direction
          : ClueDirection.ACROSS;
      return withSoftRetryDirection({ rowIdx, colIdx, direction: proposedDirection }, f);
    }

  return {
    focus: deriveInteractablePuzzleFocus(puzzleSquareWithCluesArray, focusState),
    actions: {
      toggleDirection: asCallback(toggleDirection),
      navigateToCell: asCallback(navigateToCell),
    },
  };
}

export {
  useInteractablePuzzleNavigation,
}
