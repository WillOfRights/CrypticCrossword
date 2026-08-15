package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanationPart
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.ExplanationIndicatorType
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.explanationNode.SimpleWordplayExplanationNode
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.explanationNode.WordplayExplanationNode
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common.ParentCluePart

/**
 * Wordplay formed by joining multiple wordplay parts together.
 */
@Serializable
@SerialName("crypticJuxtaposition")
data class CrypticJuxtaposition(
    override val children: List<CrypticCluePart>,
) : CrypticWordplay(),
    ParentCluePart,
    CrypticIndicable<CrypticJuxtaposition> {
    init {
        // Validate that the children match the predicate we expect.
        validateChildClueParts {
            it is CrypticWordplay ||
                it is CrypticNonIndicatorText ||
                it is CrypticJuxtapositionIndicator
        }
    }

    // Clue text is default clue text from joining children
    override val clueText: String = defaultClueText

    private val indicator: CrypticJuxtapositionIndicator? =
        ParentCluePart.Companion.getOptionalChild(children) {
            it is CrypticJuxtapositionIndicator
        }

    init {
        if (indicator != null && !indicator.isBefore) {
            assert(children.filterIsInstance<CrypticWordplay>().size == 2) {
                "If a juxtaposition indicator is used that places the first part after the second, there should be " +
                    "exactly two children."
            }
        }
    }

    // The yield is the yield of all the child wordplays combined, or the second before the first if there is a
    // before indicator.
    override val yield: String =
        if (indicator != null && !indicator.isBefore) {
            children
                .filterIsInstance<CrypticWordplay>()[1]
                .yield
                .plus(children.filterIsInstance<CrypticWordplay>()[0].yield)
        } else {
            children.filterIsInstance<CrypticWordplay>().joinToString(separator = "") { it.yield }
        }

    override fun getWordplayExplanationNode(): WordplayExplanationNode {
        return object : SimpleWordplayExplanationNode(
            clueText,
            children
                .filterIsInstance<CrypticWordplay>()
                .map { it.getWordplayExplanationNode() },
            yield,
        ) {
            override fun localConstructAsExplanationParts(
                childClueParts: List<List<CrypticClueExplanationPart>>,
                revealOwnIndicator: Boolean,
            ): List<CrypticClueExplanationPart> {
                var wordplayChildrenCount = 0
                val constructedList: MutableList<CrypticClueExplanationPart> = mutableListOf()

                for (child in children) {
                    if (child is CrypticWordplay) {
                        for (part in childClueParts[wordplayChildrenCount]) {
                            constructedList.add(part)
                        }
                        wordplayChildrenCount++
                    } else if (revealOwnIndicator && child is CrypticIndicator<*>) {
                        constructedList.add(
                            CrypticClueExplanationPart.ExplanationIndicatorPart(
                                child.clueText,
                                ExplanationIndicatorType.JUXTAPOSITION,
                            ),
                        )
                    } else {
                        constructedList.add(CrypticClueExplanationPart.ExplanationIgnoredPart(child.clueText))
                    }
                }

                return constructedList
            }
        }
    }
}

/**
 * Indicator for a cryptic juxtaposition.
 */
@Serializable
@SerialName("crypticJuxtapositionIndicator")
data class CrypticJuxtapositionIndicator(
    override val clueText: String,
    val isBefore: Boolean = true,
) : CrypticIndicator<CrypticJuxtaposition>()
