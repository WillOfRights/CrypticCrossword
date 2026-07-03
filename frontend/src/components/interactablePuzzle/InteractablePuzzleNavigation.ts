import * as React from 'react';
const { useState } = React;

import { ClueDirection, } from "../crosswordGrid/CrosswordGridTypes";
import { InteractablePuzzleFocusState } from "./InteractablePuzzleTypes";

const DEFAULT_FOCUS_STATE = { rowIdx: 0, colIdx: 0, direction: ClueDirection.ACROSS, clueNumber: 1 };

/**
  * Hook for navigation of the `InteractablePuzzle` component.
  */
function useInteractablePuzzleNavigation() {
  const [focusState, setFocusState] = useState<InteractablePuzzleFocusState>(DEFAULT_FOCUS_STATE);

  return {
    focusState
  };
}

export {
  useInteractablePuzzleNavigation,
}
