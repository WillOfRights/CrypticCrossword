package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.CrypticClueStructurable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.ParentCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.YieldableCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueStructure.CrypticClueStructure

/**
 * A double definition cryptic crossword clue.
 */
@Serializable
@SerialName("doubleDefinition")
data class CrypticDefinitionAndWordplay(override val children: List<CrypticCluePart>)
    : BaseCrypticCluePart(), ParentCluePart, YieldableCluePart, CrypticClueStructurable
{

    init {
        // Validate that the children match the predicate we expect.
        validateChildClueParts {
            it is CrypticDefinition
                    || it is CrypticNonIndicatorText
                    || it is CrypticLinkWord
        }
    }
    // Clue text is default clue text from joining children
    override val clueText: String = defaultClueText

    /**
     * Primary definition of this double definition.
     */
    private val primaryDefinition: CrypticDefinition = ParentCluePart.getOnlyChild(children) {
        it is CrypticDefinition && it.isPrimaryDefinition
    }


    /**
     * Secondary definition of this double definition.
     */
    private val secondaryDefinition: CrypticDefinition = ParentCluePart.getOnlyChild(children) {
            it is CrypticDefinition && it.isPrimaryDefinition
    }

    /**
     * Optional link word between definitions.
     */
    private val linkWord: CrypticLinkWord? = ParentCluePart.getOptionalChild(children) {
        it is CrypticLinkWord
    }

    init {
        require(primaryDefinition.yield == secondaryDefinition.yield) {
            "The yielded answer from both definitions must match."
        }
    }

    override fun getCrypticClueStructure(): CrypticClueStructure {
        TODO("Not yet implemented")
    }

    override val yield: String = primaryDefinition.yield

}