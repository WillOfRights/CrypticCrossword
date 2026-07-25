import { Dispatch, SetStateAction, } from "react";

import { ClueDirection, PuzzleSquare, PuzzleSquareWithClues, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { ForwardsOrBackwards, InteractablePuzzleFocus, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";
import { isCapitalLatinLetterOrEmpty, } from "./InteractablePuzzleUtils";
import { findNextFollowingClues, } from "./InteractablePuzzleNavigationUtils";

type InteractablePuzzleSolvingActions = {
  insertCharacter: (character: string) => void,
  deleteLastCharacter: (clueDirection: ClueDirection) => void,
};

/**
 * Custom hook to get the actions for solving an interactable puzzle.
 */
function useInteractablePuzzleSolving(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  setPuzzleSquares: Dispatch<SetStateAction<PuzzleSquare[][]>>,
  focus: InteractablePuzzleFocus)
  : { solvingActions: InteractablePuzzleSolvingActions } {

  const insertCharacter = (character: string) => {
    if (focus === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      return;
    }
    else if (!isCapitalLatinLetterOrEmpty(character)) {
      return;
    }

    setPuzzleSquares(prev => {
      const currentSquare = prev[focus.rowIdx][focus.colIdx];
      if (currentSquare === SquareType.BLOCK) {
        // Current square is a block and not enterable
        return prev;
      }
      if (currentSquare.squareType === SquareType.VERIFIED) {
        // Current square is already verified correct
        return prev;
      }

      return _efficient2DUpdate(prev, focus.rowIdx, focus.colIdx, {
        squareType: SquareType.FILLABLE,
        fill: character,
        number: currentSquare.number,
      });
    });
  };
  const deleteLastCharacter = (clueDirection: ClueDirection) => {
    if (focus === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      return;
    }
    const positionOfPreviousSquare = findNextFollowingClues(
      puzzleSquareWithCluesArray,
      focus.rowIdx,
      focus.colIdx,
      clueDirection,
      ForwardsOrBackwards.BACKWARDS,
      false,
      false
    );

    if (positionOfPreviousSquare === undefined) {
      return;
    }
    setPuzzleSquares(prev => {
      const previousSquare = prev[positionOfPreviousSquare.rowIdx][positionOfPreviousSquare.colIdx];
      if (previousSquare === SquareType.BLOCK) {
        // This case is not possible since we are guaranteed not to find a block from the function,
        // but this satisfies ts requirements.
        return prev;
      }
      if (previousSquare.squareType === SquareType.VERIFIED) {
        // Current square is already verified correct
        return prev;
      }

      return _efficient2DUpdate(
        prev,
        positionOfPreviousSquare.rowIdx,
        positionOfPreviousSquare.colIdx,
        {
          squareType: SquareType.FILLABLE,
          fill: '',
          number: previousSquare.number,
        }
      );
    });
  }

  return {
    solvingActions: {
      insertCharacter,
      deleteLastCharacter,
    },
  };
}

/**
 * Private helper to make an efficient update of one entry in a 2D state array.
 */
function _efficient2DUpdate(prev: PuzzleSquare[][], rowIdx: number, colIdx: number, value: PuzzleSquare) {
  // Copy old state, and replace fill of focused square with character
  const next = [...prev];
  next[rowIdx] = [...next[rowIdx]];
  next[rowIdx][colIdx] = value;
  return next;
}


export {
  InteractablePuzzleSolvingActions,
  useInteractablePuzzleSolving,
}
