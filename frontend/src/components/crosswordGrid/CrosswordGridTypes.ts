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
 * Type representing the clues that an individual (letter type) square is part of.
 */
type LetterSquareClues = {
    across?: number,
    down?: number,
}

/**
 * Type representing the clues that an individual square is part of.
 */
type SquareClues = LetterSquareClues | SquareType.BLOCK;

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
type HighlightablePuzzleSquare = SquareType.BLOCK | LetterSquare & {
    highlightType?: HighlightType,
}

export {
    ClueDirection,
    SquareType,
    LetterSquare,
    PuzzleSquare,
    SquareClues,
    LetterSquareClues,
    HighlightType,
    HighlightablePuzzleSquare,
};
