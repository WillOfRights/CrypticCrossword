import { ClueDirection, } from "../crosswordGrid/CrosswordGridTypes";

enum InteractablePuzzleUnfocused {
  NOT_FOCUSED,
}

type InteractablePuzzleFocusedState = {
  colIdx: number,
  rowIdx: number,
  direction: ClueDirection,
}

type InteractablePuzzleFocusState = InteractablePuzzleUnfocused.NOT_FOCUSED | InteractablePuzzleFocusedState;

/**
 * Similar to `InteractablePuzzleFocusedState`, but including values that can be derived from the state
 * (such as the clue number we are focused on).
 */
type InteractablePuzzleFocusedFull = InteractablePuzzleFocusedState & {
  clueNumber: number,
}

/**
 * Type representing the focus of an interactable puzzle, exposed by the hook `InteractablePuzzleNavigation`
 * for calling code.
 */
type InteractablePuzzleFocus = InteractablePuzzleUnfocused.NOT_FOCUSED | InteractablePuzzleFocusedFull;

/**
 * The different cardinal directions we can navigate the puzzle.
 */
enum NavigationDirection {
  RIGHT,
  LEFT,
  DOWN,
  UP,
};

/**
 * Forwards or backwards, relevant for navigating a clue.
 */
enum ForwardsOrBackwards {
  FORWARDS,
  BACKWARDS,
}

export {
  InteractablePuzzleUnfocused,
  InteractablePuzzleFocusedState,
  InteractablePuzzleFocusState,
  InteractablePuzzleFocusedFull,
  InteractablePuzzleFocus,
  NavigationDirection,
  ForwardsOrBackwards,
}

