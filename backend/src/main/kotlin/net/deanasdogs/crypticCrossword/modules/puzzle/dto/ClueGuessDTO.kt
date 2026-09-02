package net.deanasdogs.crypticCrossword.modules.puzzle.dto

import kotlinx.serialization.Serializable

/**
 * A DTO representing a guess to a clue in a puzzle.
 */
@Serializable
data class ClueGuessDTO(val direction: ClueDirectionDTO, val clueNumber: Int, val guess: String)