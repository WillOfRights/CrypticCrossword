import { InteractablePuzzleNavigationActions, NavigationDirection, } from "./InteractablePuzzleNavigation";

type PuzzleKeyboardActions = {
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
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
function useInteractablePuzzleKeyboard(actions: InteractablePuzzleNavigationActions):
  PuzzleKeyboardActions {

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const navigationDirection = KEY_TO_NAVIGATION_DIRECTION[e.key];

    if (navigationDirection !== undefined) {
      actions.moveOrToggleInDirection(navigationDirection);
    }
  };

  return { onKeyDown };
}

export {
  useInteractablePuzzleKeyboard,
}
