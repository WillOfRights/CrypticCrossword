import { InteractablePuzzleNavigationActions, NavigationDirection, } from "./InteractablePuzzleNavigation";
import { InteractablePuzzleFocus, InteractablePuzzleUnfocused } from "./InteractablePuzzleTypes";
import { isLatinLetter, } from "./InteractablePuzzleUtils";
import { InteractablePuzzleSolvingActions } from "./InteractablePuzzleSolving";

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
  focus: InteractablePuzzleFocus):
  PuzzleKeyboardActions {

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const navigationDirection = KEY_TO_NAVIGATION_DIRECTION[e.key];

    if (navigationDirection !== undefined) {
      navigationActions.moveOrToggleInDirection(navigationDirection);
    }
    else if (isLatinLetter(e.key)) {
      solvingActions.insertCharacter(e.key.toUpperCase());
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
