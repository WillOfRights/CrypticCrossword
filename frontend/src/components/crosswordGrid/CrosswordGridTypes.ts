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
}

/**
 * Type representing a square in a puzzle
 */
type PuzzleSquare = LetterSquare | SquareType.BLOCK;

export {
    SquareType,
    LetterSquare,
    PuzzleSquare,
};