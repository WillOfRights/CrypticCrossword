package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanationPart
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.explanationNode.SimpleWordplayExplanationNode
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.explanationNode.WordplayExplanationNode

/**
 * A word that translates to a different word as part of the wordplay in a cryptic clue based on its semantic meaning.
 * This can be an abbreviation or a straight definition (such as part of a charades clue).
 */
@Serializable
@SerialName("crypticSynonym")
data class CrypticSynonym(
    override val clueText: String,
    override val yield: String,
    val isAbbreviation: Boolean = false,
) : CrypticWordplay() {
    override fun getWordplayExplanationNode(): WordplayExplanationNode =
        object : SimpleWordplayExplanationNode(
            clueText,
            listOf(),
            yield,
        ) {
            override fun localConstructAsExplanationParts(
                childClueParts: List<List<CrypticClueExplanationPart>>,
                revealOwnIndicator: Boolean,
            ): List<CrypticClueExplanationPart> =
                if (revealOwnIndicator) {
                    listOf(CrypticClueExplanationPart.ExplanationYieldedPart(clueText, true))
                } else {
                    listOf(CrypticClueExplanationPart.ExplanationIgnoredPart(clueText))
                }
        }
}

