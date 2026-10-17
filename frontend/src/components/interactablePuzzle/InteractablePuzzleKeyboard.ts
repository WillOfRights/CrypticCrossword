import {InteractablePuzzleNavigationActions, NavigationDirection,} from "./InteractablePuzzleNavigation";
import {InteractablePuzzleFocus, InteractablePuzzleUnfocused} from "./InteractablePuzzleTypes";
import {isLatinLetter,} from "./InteractablePuzzleUtils";
import {InteractablePuzzleSolvingActions} from "./InteractablePuzzleSolving";
import {ClueDirection, PuzzleSquareWithClues, SquareType} from "../crosswordGrid/CrosswordGridTypes";
import React from "react";

type PuzzleKeyboardActions = {
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
};

const KEY_TO_NAVIGATION_DIRECTION: Partial<Record<string, NavigationDirection>> = {
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
    if (focus === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      // Shouldn't happen since we don't call keydown when we are unfocused
      return;
    }
    const square = puzzleSquaresWithCluesArray[focus.rowIdx][focus.colIdx];
    if (square === SquareType.BLOCK) {
      // Shouldn't happen since we shouldn't be focused on a block
      return;
    }

    const navigationDirection = KEY_TO_NAVIGATION_DIRECTION[e.key];
    if (navigationDirection !== undefined) {
      // Move using arrow keys
      navigationActions.moveOrToggleInDirection(navigationDirection, true);
    }
    else if (isLatinLetter(e.key)) {
      // Insert a letter
      solvingActions.insertCharacter(e.key.toUpperCase());
      if (square.fill.length === 0) {
        navigationActions.moveAfterEmptyInsert();
      }
      else {
        navigationActions.moveInDirection(focus.direction === ClueDirection.ACROSS
          ? NavigationDirection.RIGHT
          : NavigationDirection.DOWN,
          false);
      }
    }
    else if (e.key === "Backspace" || e.key === "Delete") {
      // Delete a letter
      if (e.key === "Backspace" && (square.fill.length === 0 || square.squareType === SquareType.VERIFIED)) {
        solvingActions.deleteLastCharacter(focus.direction);
        navigationActions.moveToLastCharacter();
      }
      else {
        solvingActions.insertCharacter('');
      }
    }
  };

  return { onKeyDown, };
}

export {
  useInteractablePuzzleKeyboard,
  PuzzleKeyboardActions,
}
