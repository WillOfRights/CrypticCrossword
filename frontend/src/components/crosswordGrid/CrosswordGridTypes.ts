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

/**
 * For squares containing letters, indicates the different highlight states that can occur.
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

type LetterSquare = {
    squareType: SquareType.FILLABLE | SquareType.VERIFIED,
    fill: String,
    highlightType: HighlightType,
}

/**
 * Type representing a square in a puzzle
 */
type PuzzleSquare = LetterSquare | SquareType.BLOCK;

export {
    SquareType,
    HighlightType,
    LetterSquare,
    PuzzleSquare,
};
