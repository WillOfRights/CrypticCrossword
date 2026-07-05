import { HighlightType } from "../crosswordGrid/CrosswordGridTypes";
import { InteractablePuzzleNavigationActions, } from "./InteractablePuzzleNavigation";
import { InteractablePuzzleFocus, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";

type PuzzleMouseActions = {
  /**
   * Get the onClick handler for the square at the given position.
   */
  onSquareClickForSquare: (rowIdx: number, colIdx: number) =>
    (e: React.MouseEvent<SVGElement>) => void,
};

/**
 * Hook to get mouse controls for an interactable puzzle.
 */
function useInteractablePuzzleMouse(actions: InteractablePuzzleNavigationActions, focus: InteractablePuzzleFocus):
  PuzzleMouseActions {
  const onSquareClickForSquare = (rowIdx: number, colIdx: number) => {
    return () => {
      if (focus !== InteractablePuzzleUnfocused.NOT_FOCUSED && focus.rowIdx === rowIdx && focus.colIdx === colIdx) {
        actions.toggleDirection();
      }
      else {
        actions.navigateToCell(rowIdx, colIdx);
      }
    }
  }

  return { onSquareClickForSquare, };
}

export {
  useInteractablePuzzleMouse,
  PuzzleMouseActions,
}
