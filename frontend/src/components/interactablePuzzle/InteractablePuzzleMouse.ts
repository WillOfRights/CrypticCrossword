import { InteractablePuzzleNavigationActions, } from "./InteractablePuzzleNavigation";
import { InteractablePuzzleFocus, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";
import React from "react";
import {ClueDirection} from "../crosswordGrid/CrosswordGridTypes";

type PuzzleMouseActions = {
  /**
   * Get the onClick handler for the square at the given position.
   */
  onSquareClickForSquare: (rowIdx: number, colIdx: number) =>
    (e: React.MouseEvent<SVGElement>) => void,
  onClickClue: (clueDirection: ClueDirection, clueNumber: number) => (e: React.MouseEvent) => void;
};

/**
 * Hook to get mouse controls for an interactable puzzle.
 */
function useInteractablePuzzleMouse(
    navigationActions: InteractablePuzzleNavigationActions,
    focus: InteractablePuzzleFocus):
  PuzzleMouseActions {
  const onSquareClickForSquare = (rowIdx: number, colIdx: number) => {
    return () => {
      if (focus !== InteractablePuzzleUnfocused.NOT_FOCUSED && focus.rowIdx === rowIdx && focus.colIdx === colIdx) {
        navigationActions.toggleDirection();
      }
      else {
        navigationActions.navigateToCell(rowIdx, colIdx);
      }
    }
  }

  const onClickClue = (clueDirection: ClueDirection, clueNumber: number) => {
    return () => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;

      navigationActions.moveToFirstUnfilledSquareInClue(clueDirection, clueNumber);
    };
  };

  return { onSquareClickForSquare, onClickClue, };
}

export {
  useInteractablePuzzleMouse,
  PuzzleMouseActions,
}
