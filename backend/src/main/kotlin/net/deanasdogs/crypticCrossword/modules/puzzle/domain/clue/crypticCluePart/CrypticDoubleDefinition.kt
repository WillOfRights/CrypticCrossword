package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanation
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common.ParentCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueStructure.CrypticClueStructure
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueStructure.CrypticClueStructurePart

/**
 * A double definition cryptic crossword clue.
 */
@Serializable
@SerialName("doubleDefinition")
data class CrypticDoubleDefinition(
    override val children: List<CrypticCluePart>,
) : BaseCrypticCluePart(),
    ParentCluePart {
    init {
        // Validate that the children match the predicate we expect.
        validateChildClueParts {
            it is CrypticDefinition ||
                it is CrypticNonIndicatorText ||
                it is CrypticLinkWord
        }
    }

    // Clue text is default clue text from joining children
    override val clueText: String = defaultClueText

    /**
     * Primary definition of this double definition.
     */
    private val primaryDefinition: CrypticDefinition =
        ParentCluePart.Companion.getOnlyChild(children) {
            it is CrypticDefinition && it.isPrimaryDefinition
        }

    /**
     * Secondary definition of this double definition.
     */
    private val secondaryDefinition: CrypticDefinition =
        ParentCluePart.Companion.getOnlyChild(children) {
            it is CrypticDefinition && !it.isPrimaryDefinition
        }

    /**
     * Optional link word(s) between definition and wordplay.
     */
    private val linkWord: CrypticLinkWord? =
        ParentCluePart.Companion.getOptionalChild(children) {
            it is CrypticLinkWord
        }

    init {
        require(primaryDefinition.yield == secondaryDefinition.yield) {
            "The yielded answer from both definitions must match."
        }
    }

    override val yield: String = primaryDefinition.yield

    override fun getCrypticClueStructure(): CrypticClueStructure {
        val primaryDefinitionStep =
            CrypticClueStructurePart.DefinitionStep(
                children.map {
                    if (it is CrypticDefinition && it.isPrimaryDefinition) {
                        it
                    } else {
                        IgnoredCluePart(it)
                    }
                },
            )

        val linkWordStep =
            linkWord?.let {
                CrypticClueStructurePart.DefinitionStep(
                    children.map {
                        it as? CrypticLinkWord ?: IgnoredCluePart(it)
                    },
                )
            }

        val secondaryDefinitionStep =
            CrypticClueStructurePart.DefinitionStep(
                children.map {
                    if (it is CrypticDefinition && !it.isPrimaryDefinition) {
                        it
                    } else {
                        IgnoredCluePart(it)
                    }
                },
            )

        return CrypticClueStructure(
            listOfNotNull(
                primaryDefinitionStep,
                linkWordStep,
                secondaryDefinitionStep,
            ),
        )
    }

    override fun getExplanation(): CrypticClueExplanation {
        TODO("Unimplemented")
    }
}

