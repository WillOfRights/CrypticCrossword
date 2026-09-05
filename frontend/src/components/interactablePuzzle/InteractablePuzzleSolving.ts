import { Dispatch, SetStateAction, } from "react";

import { ClueDirection, EditableSquare, PuzzleSquareContent, PuzzleSquareWithClues, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
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
  setPuzzleSquares: Dispatch<SetStateAction<PuzzleSquareContent[][]>>,
  focus: InteractablePuzzleFocus)
  : { solvingActions: InteractablePuzzleSolvingActions } {

  const insertCharacter = (character: string) => {
    if (focus === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      return;
    }
    else if (!isCapitalLatinLetterOrEmpty(character)) {
      return;
    }

    const currentSquare = _getEditableSquareAt(puzzleSquareWithCluesArray, focus.rowIdx, focus.colIdx);
    if (currentSquare === undefined) {
      // Current square is a block, or is verified correct, and so is not enterable
      return;
    }

    setPuzzleSquares(prev => _efficient2DUpdate(prev, focus.rowIdx, focus.colIdx, {
      fill: character,
      number: currentSquare.number,
    }));
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
      false,
      false
    );

    if (positionOfPreviousSquare === undefined) {
      return;
    }
    const previousSquare = _getEditableSquareAt(
      puzzleSquareWithCluesArray,
      positionOfPreviousSquare.rowIdx,
      positionOfPreviousSquare.colIdx);
    if (previousSquare === undefined) {
      // Previous square is verified correct, and so cannot be cleared. It is never a block, since
      // the search above is guaranteed not to find one.
      return;
    }

    setPuzzleSquares(prev => _efficient2DUpdate(
      prev,
      positionOfPreviousSquare.rowIdx,
      positionOfPreviousSquare.colIdx,
      {
        fill: '',
        number: previousSquare.number,
      }
    ));
  }

  return {
    solvingActions: {
      insertCharacter,
      deleteLastCharacter,
    },
  };
}

/**
 * Private helper to get the square at the given position, iff its fill may be edited. A block has
 * no fill to edit, and a square verified correct has been fixed by the server - through either of
 * its clues, so a solved clue's letters are fixed for the clue crossing them too.
 */
function _getEditableSquareAt(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  rowIdx: number,
  colIdx: number): EditableSquare | undefined {
  const puzzleSquareWithClues = puzzleSquareWithCluesArray[rowIdx][colIdx];
  if (puzzleSquareWithClues === SquareType.BLOCK || puzzleSquareWithClues.squareType === SquareType.VERIFIED) {
    return undefined;
  }
  return puzzleSquareWithClues;
}

/**
 * Private helper to make an efficient update of one entry in a 2D state array.
 */
function _efficient2DUpdate(prev: PuzzleSquareContent[][], rowIdx: number, colIdx: number, value: PuzzleSquareContent) {
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
