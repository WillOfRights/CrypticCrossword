package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A word that translates to a different word as part of the wordplay in a cryptic clue based on its semantic meaning.
 * This can be an abbreviation or a straight definition (such as part of a charades clue).
 */
@Serializable
@SerialName("crypticSynonym")
data class CrypticSynonym(override val clueText: String,
                     override val yield: String,
                     val isAbbreviation: Boolean = false) : CrypticWordplay()