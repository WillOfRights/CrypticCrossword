import { CluePanelClue, StatefulCluePanelClue } from "../cluePanel/CluePanelTypes";
import { PuzzleSquare, HighlightType, PuzzleSquareWithClues, SquareType, ClueDirection, PuzzleSquareWithHighlight } from "../crosswordGrid/CrosswordGridTypes";
import { InteractablePuzzleFocus, InteractablePuzzleUnfocused } from "./InteractablePuzzleTypes";

/**
 * Get the highlightable puzzle squares as a 2d array based on the focus state of the interactable puzzle.
 */
export function getHighlightablePuzzleSquares(
  puzzleSquareWithCluesArray: PuzzleSquareWithClues[][],
  focus: InteractablePuzzleFocus): PuzzleSquareWithHighlight[][] {
  if (focus === InteractablePuzzleUnfocused.NOT_FOCUSED) {
    return puzzleSquareWithCluesArray.map((rowPuzzleSquareWithClues) => rowPuzzleSquareWithClues.map((puzzleSquareWithClues) => {
      if (puzzleSquareWithClues === SquareType.BLOCK) {
        return SquareType.BLOCK;
      }

      const puzzleSquare = {
        squareType: puzzleSquareWithClues.squareType,
        fill: puzzleSquareWithClues.fill,
        number: puzzleSquareWithClues.number,
      };
      return {
        ...puzzleSquare,
        highlightType: HighlightType.UNHIGHLIGHTED,
      }
    }));
  }
  return puzzleSquareWithCluesArray.map((rowPuzzleSquareWithClues, rowIdx) => rowPuzzleSquareWithClues.map((puzzleSquareWithClues, colIdx) => {
    if (puzzleSquareWithClues === SquareType.BLOCK) {
      return SquareType.BLOCK;
    }

    const puzzleSquare = {
      squareType: puzzleSquareWithClues.squareType,
      fill: puzzleSquareWithClues.fill,
      number: puzzleSquareWithClues.number,
    };
    if (rowIdx === focus.rowIdx && colIdx === focus.colIdx) {
      return {
        ...puzzleSquare,
        highlightType: HighlightType.FOCUSED_SQUARE,
      }
    }
    if (focus.direction === ClueDirection.ACROSS && focus.clueNumber === puzzleSquareWithClues.acrossClueNumber) {
      return {
        ...puzzleSquare,
        highlightType: HighlightType.CLUE_HIGHLIGHTED,
      }
    }
    if (focus.direction === ClueDirection.DOWN && focus.clueNumber === puzzleSquareWithClues.downClueNumber) {
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
export function getSquareCluesArray(puzzleSquares: PuzzleSquare[][]): PuzzleSquareWithClues[][] {
  const puzzleSquareWithCluesArray: PuzzleSquareWithClues[][] = [];

  for (var rowIdx = 0; rowIdx < puzzleSquares.length; rowIdx++) {
    const rowSquareClues: PuzzleSquareWithClues[] = [];
    for (var colIdx = 0; colIdx < puzzleSquares[rowIdx].length; colIdx++) {
      const current = puzzleSquares[rowIdx][colIdx];
      if (current === SquareType.BLOCK) {
        rowSquareClues.push(SquareType.BLOCK);
        continue;
      }

      // Parse across and down clue values, first by the value of the previous squares, and then
      // using the number defined in the current square's cell.
      var acrossClueNumber: number | undefined, downClueNumber: number | undefined;
      if (colIdx > 0) {
        const squareLeftOfCurrent = rowSquareClues[colIdx - 1];
        if (squareLeftOfCurrent !== SquareType.BLOCK) {
          acrossClueNumber = squareLeftOfCurrent.acrossClueNumber;
        }
        else {
          acrossClueNumber = current.number;
        }
      }
      else {
        acrossClueNumber = current.number;
      }
      if (rowIdx > 0) {
        const squareAboveCurrent = puzzleSquareWithCluesArray[rowIdx - 1][colIdx];
        if (squareAboveCurrent !== SquareType.BLOCK) {
          downClueNumber = squareAboveCurrent.downClueNumber;
        }
        else {
          downClueNumber = current.number;
        }
      }
      else {
        downClueNumber = current.number;
      }

      rowSquareClues.push({ ...current, acrossClueNumber, downClueNumber });
    }
    puzzleSquareWithCluesArray.push(rowSquareClues);
  }

  return puzzleSquareWithCluesArray;
}

/**
 * Get the clue panel clues with stateful information about their status in the puzzle.
 */
export function getStatefulCluePanelClues(
  acrossCluePanelClues: CluePanelClue[],
  downCluePanelClues: CluePanelClue[],
  interactablePuzzleFocus: InteractablePuzzleFocus,
): { acrossStatefulClues: StatefulCluePanelClue[], downStatefulClues: StatefulCluePanelClue[] } {
  const clueMatchesFocus = (clueNumber: number, direction: ClueDirection) => {
    if (interactablePuzzleFocus === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      return false;
    }
    return clueNumber === interactablePuzzleFocus.clueNumber && direction === interactablePuzzleFocus.direction;
  }

  const acrossStatefulClues = acrossCluePanelClues.map(clue => ({
    ...clue,
    isAnswered: false,
    isHighlighted: clueMatchesFocus(clue.number, ClueDirection.ACROSS),
  }));
  const downStatefulClues = downCluePanelClues.map(clue => ({
    ...clue,
    isAnswered: false,
    isHighlighted: clueMatchesFocus(clue.number, ClueDirection.DOWN),
  }));

  return { acrossStatefulClues, downStatefulClues, };
}

