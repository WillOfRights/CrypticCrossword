import { PuzzleSquare, HighlightType, SquareClues, SquareType, ClueDirection, HighlightablePuzzleSquare } from "../crosswordGrid/CrosswordGridTypes";
import { InteractablePuzzleFocusState, InteractablePuzzleUnfocused } from "./InteractablePuzzleTypes";

/**
 * Get the highlightable puzzle squares as a 2d array based on the focus state of the interactable puzzle.
 * Requires the `squaresClueArray` generated from `puzzleSquares` to be passed for convenience and optimization, see
 * `getSquareCluesArray`.
 */
export function getHighlightablePuzzleSquares(
  puzzleSquares: PuzzleSquare[][],
  squareCluesArray: SquareClues[][],
  focusState: InteractablePuzzleFocusState): HighlightablePuzzleSquare[][] {
  if (focusState === InteractablePuzzleUnfocused.NOT_FOCUSED) {
    return puzzleSquares.map((rowSquareClues) => rowSquareClues.map((puzzleSquare) => {
      if (puzzleSquare === SquareType.BLOCK) {
        return SquareType.BLOCK;
      }
      return {
        ...puzzleSquare,
        highlightType: HighlightType.UNHIGHLIGHTED,
      }
    }));
  }
  return squareCluesArray.map((rowSquareClues, rowIdx) => rowSquareClues.map((squareClues, colIdx) => {
    const puzzleSquare = puzzleSquares[rowIdx][colIdx];
    if (puzzleSquare === SquareType.BLOCK || squareClues === SquareType.BLOCK) {
      if ((puzzleSquare === SquareType.BLOCK) !== (squareClues === SquareType.BLOCK)) {
        throw new Error(`At row index ${rowIdx} and column index ${colIdx}, a mismatch was detected between puzzleSquares and squareCluesArray.`);
      }
      return SquareType.BLOCK;
    }
    if (rowIdx === focusState.rowIdx && colIdx === focusState.colIdx) {
      return {
        ...puzzleSquare,
        highlightType: HighlightType.FOCUSED_SQUARE,
      }
    }
    if (focusState.direction === ClueDirection.ACROSS && focusState.clueNumber === squareClues.across) {
      return {
        ...puzzleSquare,
        highlightType: HighlightType.CLUE_HIGHLIGHTED,
      }
    }
    if (focusState.direction === ClueDirection.DOWN && focusState.clueNumber === squareClues.down) {
      return {
        ...puzzleSquare,
        highlightType: HighlightType.CLUE_HIGHLIGHTED,
      }
    }
    return {
      ...puzzleSquare,
      highlightType: HighlightType.UNHIGHLIGHTED,
    }
  }));
}

/**
 * Convert the given puzzle squares into their representation mapping each square to the clues it is part of.
 */
export function getSquareCluesArray(puzzleSquares: PuzzleSquare[][]): SquareClues[][] {
  const squareClues: SquareClues[][] = [];
  for (var rowIdx = 0; rowIdx < puzzleSquares.length; rowIdx++) {
    const rowSquareClues: SquareClues[] = [];
    for (var colIdx = 0; colIdx < puzzleSquares[rowIdx].length; colIdx++) {
      const current = puzzleSquares[rowIdx][colIdx];
      if (current === SquareType.BLOCK) {
        rowSquareClues.push(SquareType.BLOCK);
        continue;
      }

      // Parse across and down clue values, first by the value of the previous squares, and then
      // using the number defined in the current square's cell.
      var across: number | undefined, down: number | undefined;
      if (colIdx > 0) {
        const squareLeftOfCurrent = rowSquareClues[colIdx - 1];
        if (squareLeftOfCurrent != SquareType.BLOCK) {
          across = squareLeftOfCurrent.across;
        }
        else {
          across = current.number;
        }
      }
      else {
        across = current.number;
      }
      if (rowIdx > 0) {
        const squareAboveCurrent = squareClues[rowIdx - 1][colIdx];
        if (squareAboveCurrent != SquareType.BLOCK) {
          down = squareAboveCurrent.down;
        }
        else {
          down = current.number;
        }
      }
      else {
        down = current.number;
      }

      rowSquareClues.push({ across, down });
    }
    squareClues.push(rowSquareClues);
  }

  return squareClues;
}

