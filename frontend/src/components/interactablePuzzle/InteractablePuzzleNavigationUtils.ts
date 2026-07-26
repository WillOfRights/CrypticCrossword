import { ClueDirection, LetterSquareWithClues, LetterSquareWithCluesAndIdxes, PuzzleSquareWithClues, SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { InteractablePuzzleFocusedState, InteractablePuzzleFocusState, InteractablePuzzleUnfocused, InteractablePuzzleFocus, NavigationDirection, ForwardsOrBackwards } from "./InteractablePuzzleTypes";
import { getMapFromCluesToSquares } from "./InteractablePuzzleUtils";


export const NAVIGATION_DIRECTION_TO_CLUE_DIRECTION = {
  [NavigationDirection.RIGHT]: ClueDirection.ACROSS,
  [NavigationDirection.DOWN]: ClueDirection.DOWN,
  [NavigationDirection.LEFT]: ClueDirection.ACROSS,
  [NavigationDirection.UP]: ClueDirection.DOWN,
}

/**
 * Get the position of the next square in the puzzle in the given direction that is not a block type square.
 * If movePastBlock is true we will navigate past blocks, if it is false we will halt when we reach a block.
 */
export function getPositionOfNextSquareInDirection(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  rowIdx: number,
  colIdx: number,
  navigationDirection: NavigationDirection,
  movePastBlock: boolean,
): { rowIdx: number, colIdx: number } | undefined {

  let nextRowIdx = rowIdx;
  let nextColIdx = colIdx;
  const increment = () => {
    switch (navigationDirection) {
      case NavigationDirection.RIGHT:
        nextColIdx++;
        break;
      case NavigationDirection.DOWN:
        nextRowIdx++;
        break;
      case NavigationDirection.LEFT:
        nextColIdx--;
        break;
      case NavigationDirection.UP:
        nextRowIdx--;
        break;
    }
  };

  increment();

  while (0 <= nextRowIdx && 0 <= nextColIdx
    && nextRowIdx < puzzleSquareWithCluesArray.length && nextColIdx < puzzleSquareWithCluesArray[nextRowIdx].length) {
    const puzzleSquare = puzzleSquareWithCluesArray[nextRowIdx][nextColIdx];
    if (puzzleSquare !== SquareType.BLOCK) {
      return { rowIdx: nextRowIdx, colIdx: nextColIdx, };
    }
    else if (!movePastBlock) {
      return undefined;
    }

    increment();
  }

  return undefined;
}

/**
 * Find the first unfilled square in the given clue. The ignoredSquare parameter gives a square
 * to consider as filled (so that we can use this when inserting a letter as well).
 */
export function findFirstUnfilledSquareInClue(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  clueDirection: ClueDirection,
  clueNumber: number,
  ignoredSquare: { rowIdx: number, colIdx: number } | undefined = undefined) {
  const { acrossMap, downMap } = getMapFromCluesToSquares(puzzleSquareWithCluesArray);
  const map = clueDirection === ClueDirection.ACROSS
    ? acrossMap
    : downMap;
  const clueArray = map.get(clueNumber);
  if (clueArray === undefined) {
    // Clue does not exist in direction
    return undefined;
  }

  for (let idx = 0; idx < clueArray.length; idx++) {
    const square = clueArray[idx];
    const { rowIdx, colIdx } = square;
    const skipSquare = ignoredSquare !== undefined
      && (rowIdx === ignoredSquare.rowIdx && colIdx === ignoredSquare.colIdx);
    if (square.fill.length === 0 && !skipSquare) {
      return { rowIdx, colIdx, direction: clueDirection };
    }
  }

  return undefined;
}

/**
 * Helper to find the next square from the current position in the given direction of clues.
 * The specified square should be part of a clue in the given direction (not a block or only
 * in the other direction).
 */
export function findNextFollowingClues(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  rowIdx: number,
  colIdx: number,
  clueDirection: ClueDirection,
  forwardsOrBackwards: ForwardsOrBackwards,
  skipFilledSquares: boolean,
  allowWrap: boolean,
  firstTryStartOfClue: boolean,
): { rowIdx: number, colIdx: number } | undefined {
  // Validations and variables in scope
  const square = puzzleSquareWithCluesArray[rowIdx][colIdx];
  if (square === SquareType.BLOCK) {
    // Not applicable for this function
    throw new Error("Illegal argument, do not call with block type square");
  }
  const { acrossMap, downMap, } = getMapFromCluesToSquares(puzzleSquareWithCluesArray);
  const clueNumber = clueDirection === ClueDirection.ACROSS
    ? square.acrossClueNumber
    : square.downClueNumber;
  if (clueNumber === undefined) {
    throw new Error("Illegal argument, square does not exist in clue in given direction");
  }
  const initialMap = clueDirection === ClueDirection.ACROSS
    ? acrossMap
    : downMap;

  // Initial information about the starting position
  const initialClueArray = initialMap.get(clueNumber);
  if (initialClueArray === undefined) {
    throw new Error("Parsed clue map did not contain clue.");
  }
  let startingSquareIdx = initialClueArray?.findIndex(square =>
    square.rowIdx === rowIdx && square.colIdx === colIdx);
  if (startingSquareIdx === undefined) {
    throw new Error("Parsed clue map did not contain square.");
  }

  // Reusable scoped functions
  const increment = (idx) => {
    if (forwardsOrBackwards === ForwardsOrBackwards.FORWARDS) {
      return idx + 1;
    }
    else {
      return idx - 1;
    }
  };
  const searchClueArray = (clueArray: LetterSquareWithCluesAndIdxes[], initialIdx: number) => {
    let idx = initialIdx;

    idx = increment(idx);
    while (0 <= idx && idx < clueArray.length) {
      if (!skipFilledSquares || clueArray[idx].fill.length === 0) {
        return { rowIdx: clueArray[idx].rowIdx, colIdx: clueArray[idx].colIdx };
      }

      idx = increment(idx);
    }

    return undefined;
  };
  const searchMap = (
    map: Map<number, LetterSquareWithCluesAndIdxes[]>,
    initialClueNumber: number | undefined,
    initialSquareIdx: number | undefined) => {
    const sortedKeys = [...map.keys()].sort((a, b) => a - b);
    const initialArrayIdx = initialClueNumber === undefined
      ? 0
      : sortedKeys.findIndex(clueNumber => clueNumber === initialClueNumber);
    if (initialArrayIdx === undefined) {
      throw new Error("Initial clue number not contained in map");
    }
    let idx = initialArrayIdx;

    while (0 <= idx && idx < sortedKeys.length) {
      const currArray = map.get(sortedKeys[idx]);
      if (currArray === undefined) {
        throw new Error("Sorted keys contains key not in map");
      }
      const initialIdx = (initialSquareIdx !== undefined && idx === initialArrayIdx)
        ? initialSquareIdx
        : forwardsOrBackwards === ForwardsOrBackwards.FORWARDS
          ? -1
          : currArray.length;

      const searchedClueArray = searchClueArray(currArray, initialIdx);
      if (searchedClueArray !== undefined) {
        return searchedClueArray;
      }

      if (idx === initialArrayIdx && firstTryStartOfClue) {
        const searchedClue = findFirstUnfilledSquareInClue(
          puzzleSquareWithCluesArray,
          clueDirection,
          clueNumber,
          { rowIdx, colIdx });
        if (searchedClue !== undefined) {
          return searchedClue;
        }
      }

      idx = increment(idx);
    }

    return undefined;
  };

  const searchedInitialMap = searchMap(initialMap, clueNumber, startingSquareIdx);
  if (searchedInitialMap !== undefined) {
    return searchedInitialMap;
  }
  if (allowWrap) {
    const secondMap = clueDirection === ClueDirection.ACROSS
      ? downMap
      : acrossMap;
    const searchedSecondMap = searchMap(secondMap, undefined, undefined);
    if (searchedSecondMap !== undefined) {
      return searchedSecondMap;
    }

    const finalSearch = searchMap(initialMap, undefined, undefined);
    return finalSearch;
  }

  return undefined;
}

/**
 * Helper to determine if the given puzzle square is focusable and in the proposed direction.
 */
function isValidDirectionForPuzzleSquareWithClues(
  puzzleSquareWithClues: PuzzleSquareWithClues,
  clueDirection: ClueDirection): boolean {
  if (puzzleSquareWithClues === SquareType.BLOCK) {
    // Block squares are not valid for focus 
    return false;
  }

  return (clueDirection === ClueDirection.ACROSS && puzzleSquareWithClues.acrossClueNumber !== undefined)
    || (clueDirection === ClueDirection.DOWN && puzzleSquareWithClues.downClueNumber !== undefined);
}

/**
 * Helper to derive the `InteractablePuzzleFocus` from the minimal basis focus state and the puzzle with clues array.
 */
export function deriveInteractablePuzzleFocus(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  focusState: InteractablePuzzleFocusState): InteractablePuzzleFocus {
  if (focusState === InteractablePuzzleUnfocused.NOT_FOCUSED) {
    return InteractablePuzzleUnfocused.NOT_FOCUSED;
  }

  const puzzleSquareWithClues = puzzleSquareWithCluesArray[focusState.rowIdx][focusState.colIdx];
  const clueNumber = getClueNumberForSquareAndDirection(puzzleSquareWithClues, focusState.direction);
  if (!clueNumber) {
    throw new Error("Invalid focus state: focused square is not valid or in given direction.");
  }
  return {
    ...focusState,
    clueNumber,
  };
}

/**
 * Helper to only apply an update function if the `InteractablePuzzle` is focused.
 */
export function whenFocused(updateFn: (f: InteractablePuzzleFocusedState) => InteractablePuzzleFocusState) {
  return (f: InteractablePuzzleFocusState) => {
    if (f === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      return InteractablePuzzleUnfocused.NOT_FOCUSED;
    }

    return updateFn(f);
  };
};

/**
 * Given a proposed state f, return if the state is valid for the given puzzle with clues array.
 */
export function isValidProposedFocusedStateFromArray(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  f: InteractablePuzzleFocusedState) {
  return isValidDirectionForPuzzleSquareWithClues(puzzleSquareWithCluesArray[f.rowIdx][f.colIdx], f.direction);
}

/**
 * Helper to get the clue number from the given puzzle square in the proposed direction, or return
 * `undefined` if this is not valid (matches `isValidDirectionForPuzzleSquareWithClues`).
 */
function getClueNumberForSquareAndDirection(
  puzzleSquareWithClues: PuzzleSquareWithClues,
  clueDirection: ClueDirection): number | undefined {
  if (puzzleSquareWithClues === SquareType.BLOCK) {
    // Block squares are not valid for focus 
    return undefined;
  }

  if ((clueDirection === ClueDirection.ACROSS && puzzleSquareWithClues.acrossClueNumber !== undefined)) {
    return puzzleSquareWithClues.acrossClueNumber;
  }
  if ((clueDirection === ClueDirection.DOWN && puzzleSquareWithClues.downClueNumber !== undefined)) {
    return puzzleSquareWithClues.downClueNumber;
  }
  return undefined;
}
