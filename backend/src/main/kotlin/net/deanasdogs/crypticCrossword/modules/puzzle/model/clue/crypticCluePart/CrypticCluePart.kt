package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.Serializable

/**
 * Base class for part of a cryptic clue.
 */
@Serializable
sealed class CrypticCluePart {
    abstract val clueText: String
}
