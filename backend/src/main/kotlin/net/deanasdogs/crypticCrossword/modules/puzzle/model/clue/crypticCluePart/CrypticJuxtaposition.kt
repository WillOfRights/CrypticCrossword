package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.ParentCluePart

/**
 * Wordplay formed by joining multiple wordplay parts together.
 */
@Serializable
@SerialName("crypticJuxtaposition")
data class CrypticJuxtaposition(
    override val children: List<CrypticCluePart>,
) : CrypticWordplay(),
    ParentCluePart {
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
        ParentCluePart.getOptionalChild(children) {
            it is CrypticJuxtapositionIndicator
        }

    init {
        if (indicator != null && !indicator.before) {
            assert(children.filterIsInstance<CrypticWordplay>().size == 2) {
                "If a juxtaposition indicator is used that places the first part after the second, there should be " +
                    "exactly two children."
            }
        }
    }

    // The yield is the yield of all the child wordplays combined, or the second before the first if there is a
    // before indicator.
    override val yield: String =
        if (indicator != null && !indicator.before) {
            children
                .filterIsInstance<CrypticWordplay>()[1]
                .yield
                .plus(children.filterIsInstance<CrypticWordplay>()[0].yield)
        } else {
            children.filterIsInstance<CrypticWordplay>().joinToString(separator="") { it.yield }
        }
}

/**
 * Indicator for a cryptic juxtaposition.
 */
@Serializable
@SerialName("crypticJuxtapositionIndicator")
data class CrypticJuxtapositionIndicator(
    override val clueText: String,
    val before: Boolean = true,
) : CrypticCluePart()
