import { InteractablePuzzleNavigationActions, NavigationDirection, } from "./InteractablePuzzleNavigation";
import { InteractablePuzzleFocus, InteractablePuzzleUnfocused } from "./InteractablePuzzleTypes";

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
function useInteractablePuzzleKeyboard(actions: InteractablePuzzleNavigationActions, focus: InteractablePuzzleFocus):
  PuzzleKeyboardActions {

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const navigationDirection = KEY_TO_NAVIGATION_DIRECTION[e.key];

    if (navigationDirection !== undefined) {
      actions.moveOrToggleInDirection(navigationDirection);
    }
  };

  const onFocusInteractivePuzzle = (e: React.FocusEvent<HTMLElement>) => {
    if (focus === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      actions.focusFirstSquare();
    }
  };

  const onBlurInteractivePuzzle = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      // Focus left the interactive puzzle
      actions.unfocus();
    }
  };

  return { onKeyDown, onFocusInteractivePuzzle, onBlurInteractivePuzzle, };
}

export {
  useInteractablePuzzleKeyboard,
}
