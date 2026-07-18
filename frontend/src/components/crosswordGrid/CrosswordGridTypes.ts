enum ClueDirection {
    ACROSS,
    DOWN,
}

enum SquareType {
    /**
     * A blocked off square.
     */
    BLOCK,
    /**
     * A fillable square.
     */
    FILLABLE,
    /**
     * A square that has been verified to be correct.
     */
    VERIFIED,
}

type LetterSquare = {
    squareType: SquareType.FILLABLE | SquareType.VERIFIED,
    fill: String,
    number?: number,
}

/**
 * Type representing a square in a puzzle, not including information on user interactions.
 */
type PuzzleSquare = LetterSquare | SquareType.BLOCK;

/**
 * A letter square that only corresponds to an across clue.
 */
type AcrossLetterSquareWithClue = LetterSquare & {
    acrossClueNumber: number,
    downClueNumber: undefined,
}

/**
 * A letter square that only corresponds to a down clue.
 */
type DownLetterSquareWithClue = LetterSquare & {
    acrossClueNumber: undefined,
    downClueNumber: number,
}

/**
 * A letter square that has both across and down clues.
 */
type LetterSquareWithBothClues = LetterSquare & {
    acrossClueNumber: number,
    downClueNumber: number,
}

/**
 * Type representing a letter square as well as the clues that the individual square is part of.
 */
type LetterSquareWithClues = AcrossLetterSquareWithClue | DownLetterSquareWithClue | LetterSquareWithBothClues;

/**
 * Type representing any square as well as it's clue information.
 */
type PuzzleSquareWithClues = LetterSquareWithClues | SquareType.BLOCK;

/**
 * For all squares, indicates the different highlight states that can occur.
 */
enum HighlightType {
    /**
     * An unhighlighted square
     */
    UNHIGHLIGHTED,
    /**
     * A square that is part of the focused clue, but not the current keyboard focus
     */
    CLUE_HIGHLIGHTED,
    /**
     * The currently focused square
     */
    FOCUSED_SQUARE,
}

/**
 * Type representing a puzzle square as well as information about whether it is highlighted.
 */
type PuzzleSquareWithHighlight = SquareType.BLOCK | LetterSquare & {
    highlightType?: HighlightType,
}

export {
    ClueDirection,
    SquareType,
    LetterSquare,
    PuzzleSquare,
    PuzzleSquareWithClues,
    LetterSquareWithClues,
    HighlightType,
    PuzzleSquareWithHighlight,
};
