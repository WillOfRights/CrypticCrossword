import * as React from 'react';
const { useState } = React;

import { ClueDirection, PuzzleSquareWithClues, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { invertDirection, } from "../crosswordGrid/CrosswordGridUtils";

import { ForwardsOrBackwards, InteractablePuzzleFocus, InteractablePuzzleFocusedState, InteractablePuzzleFocusState, InteractablePuzzleUnfocused, NavigationDirection } from "./InteractablePuzzleTypes";
import { NAVIGATION_DIRECTION_TO_CLUE_DIRECTION, deriveInteractablePuzzleFocus, whenFocused, isValidProposedFocusedStateFromArray, getPositionOfNextSquareInDirection, findNextFollowingClues, } from "./InteractablePuzzleNavigationUtils";

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
   * movePastBlock controls whether we move past block squares while navigating in this direction.
   */
  moveInDirection: (
    navigationDirection: NavigationDirection,
    movePastBlock: boolean,
  ) => void,

  /**
   * Move to the next cell in the given direction that is a letter square, but toggle direction
   * first if the direction navigating does not match the current highlighted direction.
   * movePastBlock controls whether we move past block squares while navigating in this direction.
   */
  moveOrToggleInDirection: (
    navigationDirection: NavigationDirection,
    movePastBlock: boolean,
  ) => void,

  /**
   * Move to the first unfilled character in the current clue, or the next unfilled character 
   * in the puzzle in the direction of focus.
   */
  moveToNextUnfilled: () => void,

  /**
   * Move to last character (matches delete last character from solvable actions) in the direction
   * of focus.
   */
  moveToLastCharacter: () => void,
};

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
    movePastBlock: boolean,
  ) => (f: InteractablePuzzleFocusedState) => {
    const positionOfSquareInDirection = getPositionOfNextSquareInDirection(
      puzzleSquareWithCluesArray,
      f.rowIdx,
      f.colIdx,
      navigationDirection,
      movePastBlock);
    if (positionOfSquareInDirection !== undefined) {
      return withSoftRetryDirection(
        {
          rowIdx: positionOfSquareInDirection.rowIdx,
          colIdx: positionOfSquareInDirection.colIdx,
          direction: f.direction
        },
        f);
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
  const moveToNextInDirection = (
    forwardsOrBackwards: ForwardsOrBackwards,
    skipFilledSquares: boolean,
    allowWrap: boolean) =>
    whenFocused((f: InteractablePuzzleFocusedState) => {
      // Note that puzzle square with clues is not up to date with the fill updated asynchronously when this is called after inserting.
      // However, this function does not need to be aware of what has been updated, instead it always moves to the next block which was
      // previously unfilled, or does nothing if no squares are unfilled.

      const currSquare = puzzleSquareWithCluesArray[f.rowIdx][f.colIdx];
      if (currSquare === SquareType.BLOCK) {
        // Invalid case: focused on a block
        throw new Error("Focused on block!");
      }

      const nextUnfilled = findNextFollowingClues(
        puzzleSquareWithCluesArray,
        f.rowIdx,
        f.colIdx,
        f.direction,
        forwardsOrBackwards,
        skipFilledSquares,
        allowWrap,
      );

      if (nextUnfilled !== undefined) {
        return withSoftRetryDirection({ rowIdx: nextUnfilled.rowIdx, colIdx: nextUnfilled.colIdx, direction: f.direction }, f);
      }
      return f;
    });
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
    movePastBlock: boolean,
  ) =>
    whenFocused(moveUpdateFn(navigationDirection, movePastBlock));

  const moveOrToggleInDirection = (
    navigationDirection: NavigationDirection,
    movePastBlock: boolean,
  ) =>
    whenFocused((f: InteractablePuzzleFocusedState) => {
      const proposedMoveState = moveUpdateFn(navigationDirection, movePastBlock)(f);
      if (f.direction !== NAVIGATION_DIRECTION_TO_CLUE_DIRECTION[navigationDirection]) {
        // Toggle the direction if it is possible, but otherwise move in the given direction
        return withProposedFocusedState({ ...f, direction: invertDirection(f.direction) }, proposedMoveState);
      }
      return proposedMoveState;
    });

  const moveToNextUnfilled = () => {
    return moveToNextInDirection(
      ForwardsOrBackwards.FORWARDS,
      true,
      true,
    );
  };

  const moveToLastCharacter = () => {
    return moveToNextInDirection(
      ForwardsOrBackwards.BACKWARDS,
      false,
      false,
    );
  }


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
      moveToLastCharacter: asCallback(moveToLastCharacter),
    },
  };
}

export {
  useInteractablePuzzleNavigation,
  InteractablePuzzleNavigationActions,
  NavigationDirection,
}
