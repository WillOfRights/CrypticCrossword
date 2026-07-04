import { ClueDirection, } from "../crosswordGrid/CrosswordGridTypes";

enum InteractablePuzzleUnfocused {
  NOT_FOCUSED,
}

type InteractablePuzzleFocusedState = {
  colIdx: number,
  rowIdx: number,
  direction: ClueDirection,
}

/**
 * Similar to `InteractablePuzzleFocusedState`, but including values that can be derived from the state
 * (such as the clue number we are focused on).
 */
type InteractablePuzzleFocusedFull = InteractablePuzzleFocusedState & {
  clueNumber: number,
}

type InteractablePuzzleFocusState = InteractablePuzzleUnfocused.NOT_FOCUSED | InteractablePuzzleFocusedState;

export {
  InteractablePuzzleUnfocused,
  InteractablePuzzleFocusedState,
  InteractablePuzzleFocusState,
  InteractablePuzzleFocusedFull,
}

