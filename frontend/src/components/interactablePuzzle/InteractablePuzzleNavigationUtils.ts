import { ClueDirection, PuzzleSquareWithClues, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { InteractablePuzzleFocusedState, InteractablePuzzleFocusState, InteractablePuzzleUnfocused } from "./InteractablePuzzleTypes";

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
 * Given a proposed state f, return if the state is valid for the given puzzle clues array.
 */
export function isValidProposedFocusedStateFromArray(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  f: InteractablePuzzleFocusedState) {
  return isValidDirectionForPuzzleSquareWithClues(puzzleSquareWithCluesArray[f.rowIdx][f.colIdx], f.direction);
}

