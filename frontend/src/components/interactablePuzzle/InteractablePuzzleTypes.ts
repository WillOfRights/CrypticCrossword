import { ClueDirection, } from "../crosswordGrid/CrosswordGridTypes";
import { CluePanelSolutionState, } from "../cluePanel/CluePanelTypes";

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

/**
 * Map from clue number to its current server-verified solution state. The board has no notion of
 * correctness beyond this - it's commanded entirely by the server connection.
 */
type ClueSolutionStates = Map<number, CluePanelSolutionState>;

/**
 * A clue's current guess and completeness, as derived from the board, together with its solution
 * state, as commanded by the server connection.
 */
type ClueGuess = {
  guess: string,
  isComplete: boolean,
  solutionState: CluePanelSolutionState,
}

/**
 * Map from clue number to its current `ClueGuess`.
 */
type ClueGuesses = Map<number, ClueGuess>;

export {
  InteractablePuzzleUnfocused,
  InteractablePuzzleFocusedState,
  InteractablePuzzleFocusState,
  InteractablePuzzleFocusedFull,
  InteractablePuzzleFocus,
  NavigationDirection,
  ForwardsOrBackwards,
  ClueSolutionStates,
  ClueGuess,
  ClueGuesses,
}

