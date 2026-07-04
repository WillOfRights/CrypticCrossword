import { ClueDirection, PuzzleSquareWithClues, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { InteractablePuzzleFocusedState, InteractablePuzzleFocusState, InteractablePuzzleUnfocused, InteractablePuzzleFocus } from "./InteractablePuzzleTypes";

/**
 * Helper to get the clue number from the given puzzle square in the proposed direction, or return
 * `undefined` if this is not valid (matches `isValidDirectionForPuzzleSquareWithClues`).
 */
function getClueNumberForSquareAndDirection(
  puzzleSquareWithClues: PuzzleSquareWithClues,
  clueDirection: ClueDirection): number | undefined {
  if (puzzleSquareWithClues === SquareType.BLOCK) {
    // Block squares are not valid for focus 
    return undefined;
  }

  if ((clueDirection === ClueDirection.ACROSS && !!puzzleSquareWithClues.acrossClueNumber)) {
    return puzzleSquareWithClues.acrossClueNumber;
  }
  if ((clueDirection === ClueDirection.DOWN && !!puzzleSquareWithClues.downClueNumber)) {
    return puzzleSquareWithClues.downClueNumber;
  }
  return undefined;
}

/**
 * Helper to determine if the given puzzle square is focusable and in the proposed direction.
 */
function isValidDirectionForPuzzleSquareWithClues(
  puzzleSquareWithClues: PuzzleSquareWithClues,
  clueDirection: ClueDirection): boolean {
  if (puzzleSquareWithClues === SquareType.BLOCK) {
    // Block squares are not valid for focus 
    return false;
  }

  return (clueDirection === ClueDirection.ACROSS && !!puzzleSquareWithClues.acrossClueNumber)
    || (clueDirection === ClueDirection.DOWN && !!puzzleSquareWithClues.downClueNumber);
}

/**
 * Helper to derive the `InteractablePuzzleFocus` from the minimal basis focus state and the puzzle with clues array.
 */
export function deriveInteractablePuzzleFocus(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  focusState: InteractablePuzzleFocusState): InteractablePuzzleFocus {
  if (focusState === InteractablePuzzleUnfocused.NOT_FOCUSED) {
    return InteractablePuzzleUnfocused.NOT_FOCUSED;
  }

  const puzzleSquareWithClues = puzzleSquareWithCluesArray[focusState.rowIdx][focusState.colIdx];
  const clueNumber = getClueNumberForSquareAndDirection(puzzleSquareWithClues, focusState.direction);
  if (!clueNumber) {
    throw new Error("Invalid focus state: focused square is not valid or in given direction.");
  }
  return {
    ...focusState,
    clueNumber,
  };
}

/**
 * Helper to only apply an update function if the `InteractablePuzzle` is focused.
 */
export function whenFocused(updateFn: (f: InteractablePuzzleFocusedState) => InteractablePuzzleFocusState) {
  return (f: InteractablePuzzleFocusState) => {
    if (f === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      return InteractablePuzzleUnfocused.NOT_FOCUSED;
    }

    return updateFn(f);
  };
};

/**
 * Given a proposed state f, return if the state is valid for the given puzzle with clues array.
 */
export function isValidProposedFocusedStateFromArray(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  f: InteractablePuzzleFocusedState) {
  return isValidDirectionForPuzzleSquareWithClues(puzzleSquareWithCluesArray[f.rowIdx][f.colIdx], f.direction);
}

