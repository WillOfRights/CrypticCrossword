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

  /**
   * Move to the next cell in the given direction that is a letter square.
   */
  moveInDirection: (
    navigationDirection: NavigationDirection,
  ) => void,

  /**
   * Move to the next cell in the given direction that is a letter square, but toggle direction
   * first if the direction navigating does not match the current highlighted direction.
   */
  moveOrToggleInDirection: (
    navigationDirection: NavigationDirection,
  ) => void,
};

enum NavigationDirection {
  RIGHT,
  LEFT,
  DOWN,
  UP,
};

const NAVIGATION_DIRECTION_TO_CLUE_DIRECTION = {
  [NavigationDirection.RIGHT]: ClueDirection.ACROSS,
  [NavigationDirection.DOWN]: ClueDirection.DOWN,
  [NavigationDirection.LEFT]: ClueDirection.ACROSS,
  [NavigationDirection.UP]: ClueDirection.DOWN,
}

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
      setFocusState(action(...args));
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
  const moveUpdateFn = (
    navigationDirection: NavigationDirection,
  ) => (f: InteractablePuzzleFocusedState) => {
    let rowIdx = f.rowIdx;
    let colIdx = f.colIdx;
    const increment = () => {
      switch (navigationDirection) {
        case NavigationDirection.RIGHT:
          colIdx++;
          break;
        case NavigationDirection.DOWN:
          rowIdx++;
          break;
        case NavigationDirection.LEFT:
          colIdx--;
          break;
        case NavigationDirection.UP:
          rowIdx--;
          break;
      }
    };

    increment();

    while (0 <= rowIdx && 0 <= colIdx
      && rowIdx < puzzleSquareWithCluesArray.length && colIdx < puzzleSquareWithCluesArray[rowIdx].length) {
      const puzzleSquare = puzzleSquareWithCluesArray[rowIdx][colIdx];
      if (puzzleSquare !== SquareType.BLOCK) {
        return withSoftRetryDirection({ rowIdx, colIdx, direction: f.direction }, f);
      }

      increment();
    }

    return f;
  };

  // Navigation actions

  const toggleDirection = () => whenFocused((f: InteractablePuzzleFocusedState) => {
    return withProposedFocusedState({ ...f, direction: invertDirection(f.direction) }, f);
  });

  const navigateToCell = (rowIdx: number, colIdx: number, preferredDirection?: ClueDirection) =>
    (f: InteractablePuzzleFocusState) => {
      const proposedDirection = preferredDirection !== undefined
        ? preferredDirection
        : f !== InteractablePuzzleUnfocused.NOT_FOCUSED
          ? f.direction
          : ClueDirection.ACROSS;
      return withSoftRetryDirection({ rowIdx, colIdx, direction: proposedDirection }, f);
    }

  const moveInDirection = (
    navigationDirection: NavigationDirection,
  ) =>
    whenFocused(moveUpdateFn(navigationDirection));

  const moveOrToggleInDirection = (
    navigationDirection: NavigationDirection,
  ) =>
    whenFocused((f: InteractablePuzzleFocusedState) => {
      const proposedMoveState = moveUpdateFn(navigationDirection)(f);
      if (f.direction !== NAVIGATION_DIRECTION_TO_CLUE_DIRECTION[navigationDirection]) {
        // Toggle the direction if it is possible, but otherwise move in the given direction
        return withProposedFocusedState({ ...f, direction: invertDirection(f.direction) }, proposedMoveState);
      }
      return proposedMoveState;
    });

  return {
    focus: deriveInteractablePuzzleFocus(puzzleSquareWithCluesArray, focusState),
    actions: {
      toggleDirection: asCallback(toggleDirection),
      navigateToCell: asCallback(navigateToCell),
      moveInDirection: asCallback(moveInDirection),
      moveOrToggleInDirection: asCallback(moveOrToggleInDirection),
    },
  };
}

export {
  useInteractablePuzzleNavigation,
  InteractablePuzzleNavigationActions,
  NavigationDirection,
}
