package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanationPart
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanationStep
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common.CrypticClueExplainable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common.CrypticClueStructurable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common.YieldableCluePart

/**
 * Abstract class representing a top level cryptic clue part. Therefore, it must implement CrypticClueStructurable,
 * since it should be possible to determine the structure of the whole clue from this part, and it must implement
 * CrypticClueExplainable to get the explanation for the whole clue.
 */
@Serializable
sealed class BaseCrypticCluePart :
    CrypticCluePart(),
    CrypticClueStructurable,
    YieldableCluePart,
    CrypticClueExplainable {
    companion object {
        /**
         * Shared function to use the list of children to create the final revealed parts in the explanation of a whole clue.
         */
        fun getFinalRevealedPartsFromChildren(children: List<CrypticCluePart>) =
            children.flatMap {
                when {
                    (it is CrypticWordplay) -> it.getWordplayExplanationNode().getAsFinalRevealedParts()
                    (it is CrypticDefinition) -> listOf(CrypticClueExplanationPart.ExplanationDefinitionPart(it.clueText))
                    (it is CrypticLinkWord) -> listOf(CrypticClueExplanationPart.ExplanationLinkPart(it.clueText))
                    else -> listOf(CrypticClueExplanationPart.ExplanationIgnoredPart(it.clueText))
                }
            }

        fun getFinalExplanationStep(
            clueText: String,
            children: List<CrypticCluePart>,
        ) = CrypticClueExplanationStep(
            clueText,
            listOf(CrypticClueExplanationPart.ExplanationIgnoredPart(clueText)),
            getFinalRevealedPartsFromChildren(children),
            true,
        )
    }
}

