import { InteractablePuzzleNavigationActions, } from "./InteractablePuzzleNavigation";
import { InteractablePuzzleFocus, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";
import React, {RefObject} from "react";
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
    focus: InteractablePuzzleFocus,
    interactablePuzzleRef: RefObject<HTMLDivElement | null>):
  PuzzleMouseActions {
  const onSquareClickForSquare = (rowIdx: number, colIdx: number) => {
    return () => {
      interactablePuzzleRef.current?.focus();

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

      interactablePuzzleRef.current?.focus();

      navigationActions.moveToFirstUnfilledSquareInClue(clueDirection, clueNumber);
    };
  };

  return { onSquareClickForSquare, onClickClue, };
}

export {
  useInteractablePuzzleMouse,
  PuzzleMouseActions,
}
