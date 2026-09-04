package net.deanasdogs.crypticCrossword.modules.puzzle.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A uniquely identifying key to a clue in a puzzle.
 */
@Serializable
@SerialName("PuzzleClueKey")
data class PuzzleClueKeyDTO(
    val clueDirection: ClueDirectionDTO,
    val clueNumber: Int,
)
