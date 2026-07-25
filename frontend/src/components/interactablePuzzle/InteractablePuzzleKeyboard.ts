import { InteractablePuzzleNavigationActions, NavigationDirection, } from "./InteractablePuzzleNavigation";
import { InteractablePuzzleFocus, InteractablePuzzleUnfocused } from "./InteractablePuzzleTypes";
import { isLatinLetter, } from "./InteractablePuzzleUtils";
import { InteractablePuzzleSolvingActions } from "./InteractablePuzzleSolving";
import { ClueDirection, PuzzleSquareWithClues, SquareType } from "../crosswordGrid/CrosswordGridTypes";

type PuzzleKeyboardActions = {
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  onFocusInteractivePuzzle: (e: React.FocusEvent<HTMLElement>) => void;
  onBlurInteractivePuzzle: (e: React.FocusEvent<HTMLElement>) => void;
};

const KEY_TO_NAVIGATION_DIRECTION = {
  ["ArrowRight"]: NavigationDirection.RIGHT,
  ["ArrowDown"]: NavigationDirection.DOWN,
  ["ArrowLeft"]: NavigationDirection.LEFT,
  ["ArrowUp"]: NavigationDirection.UP,
};

/**
 * Hook to get keyboard controls for an interactable puzzle.
 */
function useInteractablePuzzleKeyboard(
  navigationActions: InteractablePuzzleNavigationActions,
  solvingActions: InteractablePuzzleSolvingActions,
  focus: InteractablePuzzleFocus,
  puzzleSquaresWithCluesArray: PuzzleSquareWithClues[][]):
  PuzzleKeyboardActions {

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const navigationDirection = KEY_TO_NAVIGATION_DIRECTION[e.key];

    if (navigationDirection !== undefined) {
      navigationActions.moveOrToggleInDirection(navigationDirection);
    }
    else if (isLatinLetter(e.key)) {
      solvingActions.insertCharacter(e.key.toUpperCase());
      if (focus !== InteractablePuzzleUnfocused.NOT_FOCUSED) {
        const square = puzzleSquaresWithCluesArray[focus.rowIdx][focus.colIdx];
        if (square !== SquareType.BLOCK) {
          if (square.fill.length === 0) {
            navigationActions.moveToNextUnfilled();
          }
          else {
            navigationActions.moveInDirection(focus.direction === ClueDirection.ACROSS
              ? NavigationDirection.RIGHT
              : NavigationDirection.DOWN);
          }
        }
      }
    }
    else if (e.key === "Backspace" || e.key === "Delete") {
      // TODO: Backspace on an empty square should delete the prior letter
      solvingActions.insertCharacter('');
    }

  };

  const onFocusInteractivePuzzle = (e: React.FocusEvent<HTMLElement>) => {
    if (focus === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      navigationActions.focusFirstSquare();
    }
  };

  const onBlurInteractivePuzzle = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      // Focus left the interactive puzzle
      navigationActions.unfocus();
    }
  };

  return { onKeyDown, onFocusInteractivePuzzle, onBlurInteractivePuzzle, };
}

export {
  useInteractablePuzzleKeyboard,
}
