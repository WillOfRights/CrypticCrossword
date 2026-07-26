import * as React from 'react';
const { useState } = React;

import { ClueDirection, PuzzleSquareWithClues, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { invertDirection, } from "../crosswordGrid/CrosswordGridUtils";

import { ForwardsOrBackwards, InteractablePuzzleFocus, InteractablePuzzleFocusedState, InteractablePuzzleFocusState, InteractablePuzzleUnfocused, NavigationDirection } from "./InteractablePuzzleTypes";
import { NAVIGATION_DIRECTION_TO_CLUE_DIRECTION, deriveInteractablePuzzleFocus, whenFocused, isValidProposedFocusedStateFromArray, getPositionOfNextSquareInDirection, findNextFollowingClues, findFirstUnfilledSquareInClue, } from "./InteractablePuzzleNavigationUtils";

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
   * Move through the puzzle in the following order:
   * 1. The next unfilled character in the current clue
   * 2. The first unfilled character in the current clue (the current square is counted as filled)
   * 3. The next unfilled character in the puzzle in the current direction
   * 4. The first unfilled character in the puzzle in the opposite direction
   * 5. The first unfilled character in the puzzle in current direction
   * 6. Do nothing if the puzzle is filled
   *
   * This is a convenient and intuitive way to traverse the puzzle after you insert a character in
   * a previously empty block.
   */
  moveAfterEmptyInsert: () => void,

  /**
   * Move to last character (matches delete last character from solvable actions) in the direction
   * of focus.
   */
  moveToLastCharacter: () => void,

  /**
   * Move to the first unfilled square in the given clue.
   */
  moveToFirstUnfilledSquareInClue: (
    clueDirection: ClueDirection,
    clueNumber: number,
  ) => void,

  /**
   * Move to the first unfilled square for the current focus.
   */
  moveToFirstUnfilledSquareForFocus: () => void,
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
  const withHardFocusedState =
    (f: InteractablePuzzleFocusedState) => {
      if (isValidProposedFocusedStateFromArray(puzzleSquareWithCluesArray, f)) {
        return f;
      }
      throw new Error("Hard focused state was invalid");
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
  const moveToNextInDirectionFn = (
    forwardsOrBackwards: ForwardsOrBackwards,
    skipFilledSquares: boolean,
    allowWrap: boolean,
    firstTryStartofClue: boolean,
    f: InteractablePuzzleFocusedState) => {
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
      firstTryStartofClue
    );

    if (nextUnfilled !== undefined) {
      return withHardFocusedState({ rowIdx: nextUnfilled.rowIdx, colIdx: nextUnfilled.colIdx, direction: nextUnfilled.direction });
    }
    return f;
  };
  const moveToFirstUnfilledFn = (
    clueDirection: ClueDirection,
    clueNumber: number,
    ignoredSquare: { rowIdx: number, colIdx: number } | undefined = undefined
  ) => findFirstUnfilledSquareInClue(puzzleSquareWithCluesArray, clueDirection, clueNumber, ignoredSquare);
  const moveToFirstUnfilledForFocusFn = (f: InteractablePuzzleFocusedState) => {
    const focusedSquare = puzzleSquareWithCluesArray[f.rowIdx][f.colIdx];
    if (focusedSquare === SquareType.BLOCK) {
      // Focused block, this case shouldn't be possible
      return f;
    }
    const clueNumber = f.direction === ClueDirection.ACROSS
      ? focusedSquare.acrossClueNumber
      : focusedSquare.downClueNumber;
    if (clueNumber === undefined) {
      // Clue direction doesn't exist for focused square, this case shouldn't be possible
      return f;
    }

    const firstUnfilledInClue = moveToFirstUnfilledFn(
      f.direction,
      clueNumber,
      { rowIdx: f.rowIdx, colIdx: f.colIdx });
    if (firstUnfilledInClue === undefined) {
      return f;
    }
    return withHardFocusedState(firstUnfilledInClue);
  }
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

  const moveToFirstUnfilledSquareInClue = (
    clueDirection: ClueDirection,
    clueNumber: number,
  ) => whenFocused((f: InteractablePuzzleFocusedState) => {
    const firstUnfilledInClue = moveToFirstUnfilledFn(clueDirection, clueNumber);
    if (firstUnfilledInClue === undefined) {
      return f;
    }
    return withProposedFocusedState(firstUnfilledInClue, f);
  });

  const moveToFirstUnfilledSquareForFocus = () => whenFocused(moveToFirstUnfilledForFocusFn);

  const moveAfterEmptyInsert = () => whenFocused((f: InteractablePuzzleFocusedState) => {
    return moveToNextInDirectionFn(
      ForwardsOrBackwards.FORWARDS,
      true,
      true,
      true,
      f
    );
  });

  const moveToLastCharacter = () => whenFocused((f: InteractablePuzzleFocusedState) => {
    return moveToNextInDirectionFn(
      ForwardsOrBackwards.BACKWARDS,
      false,
      false,
      false,
      f
    );
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
      moveAfterEmptyInsert: asCallback(moveAfterEmptyInsert),
      moveToLastCharacter: asCallback(moveToLastCharacter),
      moveToFirstUnfilledSquareInClue: asCallback(moveToFirstUnfilledSquareInClue),
      moveToFirstUnfilledSquareForFocus: asCallback(moveToFirstUnfilledSquareForFocus)
    },
  };
}

export {
  useInteractablePuzzleNavigation,
  InteractablePuzzleNavigationActions,
  NavigationDirection,
}
