package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A link word (but can be any text) between two definitions or the definition and wordplay.
 */
@Serializable
@SerialName("linkWord")
data class CrypticLinkWord(override val clueText: String) : CrypticCluePart() {
}