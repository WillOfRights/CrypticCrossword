package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.CrypticClueStructurable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.ParentCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.YieldableCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueStructure.CrypticClueStructure

/**
 * A standard cryptic clue: with a definition and wordplay.
 */
@Serializable
@SerialName("definitionAndWordplay")
data class CrypticDefinitionAndWordplay(override val children: List<CrypticCluePart>)
    : BaseCrypticCluePart(), ParentCluePart, YieldableCluePart, CrypticClueStructurable
{

    init {
        // Validate that the children match the predicate we expect.
        validateChildClueParts {
            it is CrypticDefinition
                    || it is CrypticWordplay
                    || it is CrypticNonIndicatorText
                    || it is CrypticLinkWord
        }
    }
    // Clue text is default clue text from joining children
    override val clueText: String = defaultClueText

    /**
     * Definition part of this clue.
     */
    private val definition: CrypticDefinition = ParentCluePart.getOnlyChild(children) {
        it is CrypticDefinition
    }

    /**
     * Wordplay part of this clue.
     */
    @Contextual
    private val wordplay: CrypticWordplay = ParentCluePart.getOnlyChild(children) {
        it is CrypticWordplay
    }

    /**
     * Optional link word(s) between definition and wordplay.
     */
    private val linkWord: CrypticLinkWord? = ParentCluePart.getOptionalChild(children) {
        it is CrypticLinkWord
    }

    init {
        require(definition.yield == wordplay.yield) {
            "The yielded answer from the definition and wordplay must match"
        }
    }

    override fun getCrypticClueStructure(): CrypticClueStructure {
        TODO("Not yet implemented")
    }

    override val yield: String = definition.yield

}