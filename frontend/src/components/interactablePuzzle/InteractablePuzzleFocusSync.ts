import { InteractablePuzzleNavigationActions, } from "./InteractablePuzzleNavigation";
import { InteractablePuzzleFocus, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";
import React, { RefObject, useEffect, } from "react";

type KeyboardInputFocusProps = {
  onFocus: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLElement>) => void;
};

/**
 * Hook that keeps the puzzle's focus state and the keyboard input's DOM focus in agreement, and returns the props
 * for the hidden input ref.
 */
function useKeyboardInputFocusSync(
  navigationActions: InteractablePuzzleNavigationActions,
  focus: InteractablePuzzleFocus,
  keyboardInputRef: RefObject<HTMLInputElement | null>):
  KeyboardInputFocusProps {
  const isPuzzleFocused = focus !== InteractablePuzzleUnfocused.NOT_FOCUSED;

  useEffect(() => {
    if (isPuzzleFocused && document.activeElement !== keyboardInputRef.current) {
      keyboardInputRef.current?.focus({ preventScroll: true });
    }
  }, [isPuzzleFocused]);

  const onFocus = () => {
    if (!isPuzzleFocused) {
      navigationActions.focusFirstSquare();
    }
  };

  const onBlur = () => {
    navigationActions.unfocus();
  };

  return { onFocus, onBlur, };
}

export {
  useKeyboardInputFocusSync,
  KeyboardInputFocusProps,
}
