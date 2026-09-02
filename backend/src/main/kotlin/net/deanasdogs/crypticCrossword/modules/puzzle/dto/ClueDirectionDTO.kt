package net.deanasdogs.crypticCrossword.modules.puzzle.dto

import kotlinx.serialization.Serializable

/**
 * A DTO for the direction of a clue.
 */
@Serializable
enum class ClueDirectionDTO {
    ACROSS,
    DOWN,
}