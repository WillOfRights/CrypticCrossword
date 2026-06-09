package net.deanasdogs.crypticCrossword.modules.puzzle.domain

import net.deanasdogs.crypticCrossword.modules.puzzle.domain.square.PuzzleSquare

/**
 * A cryptic crossword puzzle, including a grid, clues, and a solution.
 */
class Puzzle(
    val width: Int,
    val height: Int,
    val squares: List<List<PuzzleSquare>>,
) {
    init {
        require(width > 0 && height > 0) {
            "Puzzle square must have width and height."
        }
        require(squares.size == height && squares.stream().allMatch { row -> row.size == width }) {
            "Puzzle must have same dimensions as height and width."
        }
    }
}
