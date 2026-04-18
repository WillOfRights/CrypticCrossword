package net.deanasdogs.crypticCrossword.modules.puzzle.model.square

/**
 * Class representing a square in a puzzle.
 */
class PuzzleSquare(
    val puzzleSquareType: PuzzleSquareType,
    val fill: String?,
) {
    init {
        require(puzzleSquareType != PuzzleSquareType.BLOCK || fill == null) {
            "A block type square cannot have fill."
        }
        require(puzzleSquareType != PuzzleSquareType.FILLABLE || fill != null) {
            "A verified square must have fill."
        }
    }
}
