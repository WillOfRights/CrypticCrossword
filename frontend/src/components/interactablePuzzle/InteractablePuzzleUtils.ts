import { CluePanelClue, CluePanelSolutionState, SolvableCluePanelClue, HighlightableCluePanelClue } from "../cluePanel/CluePanelTypes";
import { PuzzleSquare, HighlightType, PuzzleSquareWithClues, SquareType, ClueDirection, PuzzleSquareWithHighlight, LetterSquareWithClues, LetterSquareWithCluesAndIdxes } from "../crosswordGrid/CrosswordGridTypes";
import { ClueGuesses, ClueSolutionStates, InteractablePuzzleFocus, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";

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
export function getSquareCluesArray(
  puzzleSquares: PuzzleSquare[][],
  acrossCluePanelClues: CluePanelClue[],
  downCluePanelClues: CluePanelClue[])
  : PuzzleSquareWithClues[][] {
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
          acrossClueNumber = _getNumberIfMatchesClue(current.number, acrossCluePanelClues);
        }
      }
      else {
        acrossClueNumber = _getNumberIfMatchesClue(current.number, acrossCluePanelClues);
      }
      if (rowIdx > 0) {
        const squareAboveCurrent = puzzleSquareWithCluesArray[rowIdx - 1][colIdx];
        if (squareAboveCurrent !== SquareType.BLOCK) {
          downClueNumber = squareAboveCurrent.downClueNumber;
        }
        else {
          downClueNumber = _getNumberIfMatchesClue(current.number, downCluePanelClues);
        }
      }
      else {
        downClueNumber = _getNumberIfMatchesClue(current.number, downCluePanelClues);
      }

      if (acrossClueNumber !== undefined) {
        rowSquareClues.push({ ...current, acrossClueNumber, downClueNumber });
      }
      else if (downClueNumber !== undefined) {
        rowSquareClues.push({ ...current, acrossClueNumber, downClueNumber });
      }
      else {
        throw new Error(`Square at ${rowIdx}, ${colIdx} does not have a corresponding clue in either direction`);
      }
    }
    puzzleSquareWithCluesArray.push(rowSquareClues);
  }

  return puzzleSquareWithCluesArray;
}

/**
 * Get each clue's current guess and completeness, derived from the board, together with its
 * solution state as commanded by `acrossClueStates` / `downClueStates` - InteractablePuzzle has
 * no notion of whether a clue is correct, only what it's been told to display.
 */
export function getClueGuesses(
  acrossCluePanelClues: CluePanelClue[],
  downCluePanelClues: CluePanelClue[],
  puzzleSquaresWithCluesArray: PuzzleSquareWithClues[][],
  acrossClueStates: ClueSolutionStates,
  downClueStates: ClueSolutionStates,
): { acrossClueGuesses: ClueGuesses, downClueGuesses: ClueGuesses } {
  const { acrossMap, downMap } = getMapFromCluesToSquares(puzzleSquaresWithCluesArray);

  const guessesFor = (
    clues: CluePanelClue[],
    cluesToSquares: Map<number, LetterSquareWithCluesAndIdxes[]>,
    clueStates: ClueSolutionStates,
  ): ClueGuesses =>
    new Map(clues.map(clue => {
      const squares = cluesToSquares.get(clue.number) ?? [];
      return [clue.number, {
        guess: squares.map(square => square.fill).join(''),
        isComplete: squares.length > 0 && squares.every(square => square.fill.length !== 0),
        solutionState: clueStates.get(clue.number) ?? CluePanelSolutionState.NOT_COMPLETED,
      }];
    }));

  return {
    acrossClueGuesses: guessesFor(acrossCluePanelClues, acrossMap, acrossClueStates),
    downClueGuesses: guessesFor(downCluePanelClues, downMap, downClueStates),
  };
}

/**
 * Get the clue panel clues with information about whether they are highlighted.
 */
export function getHighlightableCluePanelClues(
  acrossCluePanelClues: SolvableCluePanelClue[],
  downCluePanelClues: SolvableCluePanelClue[],
  interactablePuzzleFocus: InteractablePuzzleFocus,
): { acrossHighlightableClues: HighlightableCluePanelClue[], downHighlightableClues: HighlightableCluePanelClue[] } {
  const clueMatchesFocus = (clueNumber: number, direction: ClueDirection) => {
    if (interactablePuzzleFocus === InteractablePuzzleUnfocused.NOT_FOCUSED) {
      return false;
    }
    return clueNumber === interactablePuzzleFocus.clueNumber && direction === interactablePuzzleFocus.direction;
  }

  const acrossHighlightableClues = acrossCluePanelClues.map(clue => ({
    ...clue,
    isHighlighted: clueMatchesFocus(clue.number, ClueDirection.ACROSS),
  }));
  const downHighlightableClues = downCluePanelClues.map(clue => ({
    ...clue,
    isHighlighted: clueMatchesFocus(clue.number, ClueDirection.DOWN),
  }));

  return { acrossHighlightableClues, downHighlightableClues, };
}

/**
 * Function to invert puzzle squares with clues into a map from clues to their respective squares.
 */
export function getMapFromCluesToSquares(puzzleSquareWithCluesArray: PuzzleSquareWithClues[][])
  : { acrossMap: Map<number, LetterSquareWithCluesAndIdxes[]>, downMap: Map<number, LetterSquareWithCluesAndIdxes[]> } {
  const acrossMap = new Map<number, LetterSquareWithCluesAndIdxes[]>;
  const downMap = new Map<number, LetterSquareWithCluesAndIdxes[]>;

  for (let rowIdx = 0; rowIdx < puzzleSquareWithCluesArray.length; rowIdx++) {
    for (let colIdx = 0; colIdx < puzzleSquareWithCluesArray[rowIdx].length; colIdx++) {
      const currSquare = puzzleSquareWithCluesArray[rowIdx][colIdx];
      if (currSquare === SquareType.BLOCK) { continue; }

      const currSquareWithIdxes = {
        ...currSquare,
        rowIdx,
        colIdx,
      };
      if (currSquare.acrossClueNumber !== undefined) {
        const acrossValue = acrossMap.get(currSquare.acrossClueNumber);
        if (acrossValue === undefined) {
          acrossMap.set(currSquare.acrossClueNumber, [currSquareWithIdxes]);
        }
        else {
          acrossValue.push(currSquareWithIdxes);
        }
      }
      if (currSquare.downClueNumber !== undefined) {
        const downValue = downMap.get(currSquare.downClueNumber);
        if (downValue === undefined) {
          downMap.set(currSquare.downClueNumber, [currSquareWithIdxes]);
        }
        else {
          downValue.push(currSquareWithIdxes);
        }
      }
    }
  }

  return { acrossMap, downMap };
}

/**
 * Check if a letter is a latin letter (ignores caps).
 */
export function isLatinLetter(key: string) { return /^[A-Za-z]$/.test(key) };

/**
 * Check if a letter is a capital latin letter.
 */
export function isCapitalLatinLetterOrEmpty(key: string) { return /^[A-Z]?$/.test(key) };

/**
 * Private helper to get a number, iff there is a matching clue panel clue with that number.
 * Used so that we only define the across and down number of a row if they actually match a clue.
 */
function _getNumberIfMatchesClue(number: number | undefined, cluePanelClues: CluePanelClue[]): number | undefined {
  return cluePanelClues.some(cluePanelClue => cluePanelClue.number === number)
    ? number
    : undefined;
}

