package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A small wrapper on a clue part that indicates it is not relevant for the structure part that contains it (for example
 * the definition when we are showing the wordplay, vice versa, etc.)
 */
@Serializable
@SerialName("ignoredCluePart")
data class IgnoredCluePart(val ignoredCluePart: CrypticCluePart) : CrypticCluePart() {
    override val clueText: String
        get() = ignoredCluePart.clueText
}
