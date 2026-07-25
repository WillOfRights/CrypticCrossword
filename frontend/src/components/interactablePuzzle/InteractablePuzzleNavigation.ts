import * as React from 'react';
const { useState } = React;

import { ClueDirection, PuzzleSquareWithClues, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { invertDirection, } from "../crosswordGrid/CrosswordGridUtils";

import { InteractablePuzzleFocus, InteractablePuzzleFocusedState, InteractablePuzzleFocusState, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";
import { deriveInteractablePuzzleFocus, whenFocused, isValidProposedFocusedStateFromArray, } from "./InteractablePuzzleNavigationUtils";

type InteractablePuzzleNavigationActions = {
  /**
   * Unfocus the interactable puzzle.
   */
  unfocus: () => void,

  /**
   * Focus the first square in the puzzle.
   */
  focusFirstSquare: () => void,

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

  /**
   * Move to the next cell in the puzzle that is not unfilled. First tries to complete the clue
   * in the current direction, then tries all subsequent clues in the same direction, then restarts
   * at the beginning and works through the clue lexicographically, soft retrying the opposite direction.
   */
  moveToNextUnfilled: () => void,
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
  : { focus: InteractablePuzzleFocus, navigationActions: InteractablePuzzleNavigationActions } {
  const [focusState, setFocusState] = useState<InteractablePuzzleFocusState>(DEFAULT_FOCUS_STATE);

  // Reused helpers that require scoped variables

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
  const findFirstHighlightableSquare = () => {
    for (let rowIdx = 0; rowIdx < puzzleSquareWithCluesArray.length; rowIdx++) {
      for (let colIdx = 0; colIdx < puzzleSquareWithCluesArray[rowIdx].length; colIdx++) {
        if (puzzleSquareWithCluesArray[rowIdx][colIdx] !== SquareType.BLOCK) {
          return { rowIdx, colIdx };
        }
      }
    }
    throw new Error("No non-block squares found, cannot select first square.");
  };

  // Navigation actions
  const unfocus = () => InteractablePuzzleUnfocused.NOT_FOCUSED;

  const focusFirstSquare = () => (f: InteractablePuzzleFocusState) => {
    const { rowIdx, colIdx } = findFirstHighlightableSquare();
    return withSoftRetryDirection({ rowIdx, colIdx, direction: ClueDirection.ACROSS }, InteractablePuzzleUnfocused.NOT_FOCUSED);
  }

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

  const moveToNextUnfilled = () =>
    whenFocused((f: InteractablePuzzleFocusedState) => {
      // Note that puzzle square with clues is not up to date with the fill updated asynchronously when this is called after inserting.
      // However, this function does not need to be aware of what has been updated, instead it always moves to the next block which was
      // previously unfilled, or does nothing if no squares are unfilled.

      const currSquare = puzzleSquareWithCluesArray[f.rowIdx][f.colIdx];
      if (currSquare === SquareType.BLOCK) {
        // Invalid case: focused on a block
        throw new Error("Focused on block!");
      }

      // If we are navigating down, first check if there is a letter not completed in this direction
      if (f.direction === ClueDirection.DOWN) {
        let targetSquare: PuzzleSquareWithClues = currSquare;
        let targetRowIdx = f.rowIdx;
        while (targetSquare !== SquareType.BLOCK && targetRowIdx < puzzleSquareWithCluesArray.length - 1) {
          targetRowIdx++;
          targetSquare = puzzleSquareWithCluesArray[targetRowIdx][f.colIdx];
          if (targetSquare !== SquareType.BLOCK && targetSquare.fill.length === 0) {
            return { rowIdx: targetRowIdx, colIdx: f.colIdx, direction: ClueDirection.DOWN, };
          }
        }
      }

      // Then, navigate the whole puzzle starting from the current position to find an empty square
      // in the same puzzle direction
      for (let rowIdx = f.rowIdx; rowIdx < puzzleSquareWithCluesArray.length; rowIdx++) {
        for (let colIdx = 0; colIdx < puzzleSquareWithCluesArray[rowIdx].length; colIdx++) {
          if (rowIdx === f.rowIdx && colIdx <= f.colIdx) {
            continue;
          }
          const square = puzzleSquareWithCluesArray[rowIdx][colIdx];
          if (square !== SquareType.BLOCK && square.fill.length === 0) {
            const proposedState = { rowIdx, colIdx, direction: f.direction };
            if (isValidProposedFocusedStateFromArray(puzzleSquareWithCluesArray, proposedState)) {
              return proposedState;
            }
          }
        }
      }

      // If none are found, navigate the whole puzzle from the beginning, soft retrying the opposite
      // direction if we find an empty square.
      for (let rowIdx = 0; rowIdx < puzzleSquareWithCluesArray.length; rowIdx++) {
        for (let colIdx = 0; colIdx < puzzleSquareWithCluesArray[rowIdx].length; colIdx++) {
          const square = puzzleSquareWithCluesArray[rowIdx][colIdx];
          if (square !== SquareType.BLOCK && square.fill.length === 0) {
            const oppositeDirection = f.direction === ClueDirection.ACROSS
              ? ClueDirection.DOWN
              : ClueDirection.ACROSS;
            return withSoftRetryDirection({ rowIdx, colIdx, direction: oppositeDirection }, f);
          }
        }
      }

      // Puzzle is entirely full
      return f;
    });

  return {
    focus: deriveInteractablePuzzleFocus(puzzleSquareWithCluesArray, focusState),
    navigationActions: {
      unfocus: asCallback(unfocus),
      focusFirstSquare: asCallback(focusFirstSquare),
      toggleDirection: asCallback(toggleDirection),
      navigateToCell: asCallback(navigateToCell),
      moveInDirection: asCallback(moveInDirection),
      moveOrToggleInDirection: asCallback(moveOrToggleInDirection),
      moveToNextUnfilled: asCallback(moveToNextUnfilled),
    },
  };
}

export {
  useInteractablePuzzleNavigation,
  InteractablePuzzleNavigationActions,
  NavigationDirection,
}
