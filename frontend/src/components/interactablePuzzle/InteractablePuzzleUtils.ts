import { CluePanelClue, CluePanelSolutionState, SolvableCluePanelClue, HighlightableCluePanelClue } from "../cluePanel/CluePanelTypes";
import { PuzzleSquareContent, HighlightType, PuzzleSquareWithClues, SquareType, ClueDirection, PuzzleSquareWithHighlight, LetterSquareType, LetterSquareWithClues, LetterSquareWithCluesAndIdxes, ClueBorder } from "../crosswordGrid/CrosswordGridTypes";
import { ClueGuesses, ClueSolutionStates, InteractablePuzzleFocus, InteractablePuzzleUnfocused, } from "./InteractablePuzzleTypes";
import { ClueDirectionType, } from "../../schemas/domain/puzzle/ClueDirection";

/**
 * Convert the UI's `ClueDirection` to the wire format's, for sending a guess to the server.
 */
export function toWireClueDirection(direction: ClueDirection): ClueDirectionType {
  return direction === ClueDirection.ACROSS ? 'ACROSS' : 'DOWN';
}

/**
 * Convert a wire format `ClueDirection` to the UI's, for a message received from the server.
 */
export function fromWireClueDirection(direction: ClueDirectionType): ClueDirection {
  return direction === 'ACROSS' ? ClueDirection.ACROSS : ClueDirection.DOWN;
}

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
 * Combine the stored puzzle squares with the clues they are part of and the solution states those
 * clues have been commanded into, giving the squares every layer above this one works from. A
 * square takes its type from either of its clues, so the letters of a clue verified correct are
 * fixed for the clue crossing them too.
 */
export function getSquareCluesArray(
  puzzleSquares: PuzzleSquareContent[][],
  acrossCluePanelClues: CluePanelClue[],
  downCluePanelClues: CluePanelClue[],
  acrossClueStates: ClueSolutionStates,
  downClueStates: ClueSolutionStates)
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

      const squareType = _getSquareType(acrossClueNumber, acrossClueStates, downClueNumber, downClueStates);
      if (acrossClueNumber !== undefined) {
        rowSquareClues.push({ ...current, squareType, acrossClueNumber, downClueNumber });
      }
      else if (downClueNumber !== undefined) {
        rowSquareClues.push({ ...current, squareType, acrossClueNumber, downClueNumber });
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
 * Get the `ClueBorder`s given the current puzzle and clue information, specifically getting the borders which relate
 * to incorrect clues.
 */
export function getIncorrectClueBorders(
  puzzleSquaresWithCluesArray: PuzzleSquareWithClues[][],
  acrossCluePanelClues: CluePanelClue[],
  downCluePanelClues: CluePanelClue[],
  acrossClueStates: ClueSolutionStates,
  downClueStates: ClueSolutionStates,
): ClueBorder[] {
  const { acrossMap, downMap } = getMapFromCluesToSquares(puzzleSquaresWithCluesArray);

  const bordersFor = (
    clues: CluePanelClue[],
    cluesToSquares: Map<number, LetterSquareWithCluesAndIdxes[]>,
    clueStates: ClueSolutionStates,
    direction: ClueDirection,
  ): ClueBorder[] =>
    clues.flatMap(clue => {
      if (clueStates.get(clue.number) !== CluePanelSolutionState.VERIFIED_INCORRECT) {
        return [];
      }
      const squares = cluesToSquares.get(clue.number) ?? [];
      if (squares.length === 0) {
        return [];
      }
      return [{
        direction,
        startRowIdx: squares[0].rowIdx,
        startColIdx: squares[0].colIdx,
        length: squares.length,
      }];
    });

  return [
    ...bordersFor(acrossCluePanelClues, acrossMap, acrossClueStates, ClueDirection.ACROSS),
    ...bordersFor(downCluePanelClues, downMap, downClueStates, ClueDirection.DOWN),
  ];
}

/**
 * Attach each clue's solution state, as derived by `getClueGuesses`, to the clue panel clue itself.
 */
export function toSolvableCluePanelClues(cluePanelClues: CluePanelClue[], clueGuesses: ClueGuesses): SolvableCluePanelClue[] {
  return cluePanelClues.map(clue => ({
    ...clue,
    solutionState: clueGuesses.get(clue.number)?.solutionState ?? CluePanelSolutionState.NOT_COMPLETED,
  }));
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
 * Function to invert puzzle squares with clues into a map from clues to their respective squares. Returns in order
 * of their appearance in the puzzle in both maps from left to right and top to bottom.
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
 * Private helper for the type a letter square takes from the solution states of the clues it is
 * part of. A clue verified correct wins over one verified incorrect crossing it - that letter has
 * been confirmed either way. The single point to extend when another solution state (such as a clue
 * revealed to every solver) should give a square its own type.
 */
function _getSquareType(
  acrossClueNumber: number | undefined,
  acrossClueStates: ClueSolutionStates,
  downClueNumber: number | undefined,
  downClueStates: ClueSolutionStates): LetterSquareType {
  const isClueInState = (clueNumber: number | undefined, clueStates: ClueSolutionStates, state: CluePanelSolutionState) =>
    clueNumber !== undefined && clueStates.get(clueNumber) === state;

  if (isClueInState(acrossClueNumber, acrossClueStates, CluePanelSolutionState.VERIFIED_CORRECT)
    || isClueInState(downClueNumber, downClueStates, CluePanelSolutionState.VERIFIED_CORRECT)) {
    return SquareType.VERIFIED;
  }
  if (isClueInState(acrossClueNumber, acrossClueStates, CluePanelSolutionState.VERIFIED_INCORRECT)
    || isClueInState(downClueNumber, downClueStates, CluePanelSolutionState.VERIFIED_INCORRECT)) {
    return SquareType.VERIFIED_INCORRECT;
  }
  return SquareType.FILLABLE;
}

/**
 * Private helper to get a number, iff there is a matching clue panel clue with that number.
 * Used so that we only define the across and down number of a row if they actually match a clue.
 */
function _getNumberIfMatchesClue(number: number | undefined, cluePanelClues: CluePanelClue[]): number | undefined {
  return cluePanelClues.some(cluePanelClue => cluePanelClue.number === number)
    ? number
    : undefined;
}

