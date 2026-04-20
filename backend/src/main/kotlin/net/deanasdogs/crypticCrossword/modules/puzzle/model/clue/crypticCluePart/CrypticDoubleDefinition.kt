package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.CrypticClueStructurable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.ParentCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.YieldableCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueStructure.CrypticClueStructure

@Serializable
@SerialName("doubleDefinition")
data class CrypticDoubleDefinition(override val children: List<CrypticCluePart>)
    : BaseCrypticCluePart(), ParentCluePart, YieldableCluePart, CrypticClueStructurable
{

    init {
        // Validate that the children match the predicate we expect.
        validateChildClueParts(allowedChildrenPredicate)
    }
    // Clue text is default clue text from joining children
    override val clueText: String = defaultClueText

    /**
     * Primary definition of this double definition.
     */
    private val primaryDefinition: CrypticDefinition =
        ParentCluePart.Companion.getOnlyChild(children, primaryDefinitionPredicate)

    /**
     * Secondary definition of this double definition.
     */
    private val secondaryDefinition: CrypticDefinition =
        ParentCluePart.Companion.getOnlyChild(children, secondaryDefinitionPredicate)

    /**
     * Optional link word between definitions.
     */
    private val linkWord: CrypticLinkWord? =
        ParentCluePart.Companion.getOptionalChild(children, linkWordPredicate)

    init {
        require(primaryDefinition.getYield() == secondaryDefinition.getYield()) {
            "The yielded answer from both definitions must match."
        }
    }

    override fun getCrypticClueStructure(): CrypticClueStructure {
        TODO("Not yet implemented")
    }

    override fun getYield(): String = primaryDefinition.getYield()

    companion object {
        /**
         * Predicate for allowed children.
         */
        private val allowedChildrenPredicate: (CrypticCluePart) -> Boolean =
            {
                it is CrypticDefinition
                        || it is CrypticNonIndicatorText
                        || it is CrypticLinkWord
            }

        /**
         * Predicate for the primary definition.
         */
        private val primaryDefinitionPredicate: (CrypticCluePart) -> Boolean = {
            it is CrypticDefinition && it.isPrimaryDefinition
        }

        /**
         * Predicate for the secondary definition.
         */
        private val secondaryDefinitionPredicate: (CrypticCluePart) -> Boolean = {
            it is CrypticDefinition && !it.isPrimaryDefinition
        }

        /**
         * Predicate for link word.
         */
        private val linkWordPredicate: (CrypticCluePart) -> Boolean = {
            it is CrypticLinkWord
        }

    }

}