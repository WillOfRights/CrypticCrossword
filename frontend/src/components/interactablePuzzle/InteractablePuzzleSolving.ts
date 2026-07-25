import { Dispatch, SetStateAction, } from "react";

import { PuzzleSquare, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { InteractablePuzzleFocus, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";
import { isCapitalLatinLetterOrEmpty, } from "./InteractablePuzzleUtils";

type InteractablePuzzleSolvingActions = {
  insertCharacter: (character: string) => void,
};

/**
 * Custom hook to get the actions for solving an interactable puzzle.
 */
function useInteractablePuzzleSolving(
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

      // Copy old state, and replace fill of focused square with character
      const next = [...prev];
      next[focus.rowIdx] = [...next[focus.rowIdx]];
      next[focus.rowIdx][focus.colIdx] = {
        squareType: SquareType.FILLABLE,
        fill: character,
        number: currentSquare.number,
      };
      return next;
    });
  };

  return {
    solvingActions: {
      insertCharacter,
    },
  };
}

export {
  InteractablePuzzleSolvingActions,
  useInteractablePuzzleSolving,
}
