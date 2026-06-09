package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanation
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common.ParentCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueStructure.CrypticClueStructure
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueStructure.CrypticClueStructurePart

/**
 * A standard cryptic clue: with a definition and wordplay.
 */
@Serializable
@SerialName("definitionAndWordplay")
data class CrypticDefinitionAndWordplay(override val children: List<CrypticCluePart>)
    : BaseCrypticCluePart(), ParentCluePart
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
    private val definition: CrypticDefinition = ParentCluePart.Companion.getOnlyChild(children) {
        it is CrypticDefinition
    }

    /**
     * Wordplay part of this clue.
     */
    private val wordplay: CrypticWordplay = ParentCluePart.Companion.getOnlyChild(children) {
        it is CrypticWordplay
    }

    /**
     * Optional link word(s) between definition and wordplay.
     */
    private val linkWord: CrypticLinkWord? = ParentCluePart.Companion.getOptionalChild(children) {
        it is CrypticLinkWord
    }

    init {
        require(definition.yield == wordplay.yield) {
            "The yielded answer from the definition and wordplay must match"
        }
    }

    override val yield: String = definition.yield

    override fun getCrypticClueStructure(): CrypticClueStructure {
        val wordplayStep = CrypticClueStructurePart.WordplayStep(children.map {
            it as? CrypticWordplay ?: IgnoredCluePart(it)
        })

        val linkWordStep = linkWord?.let {
            CrypticClueStructurePart.DefinitionStep(children.map {
                it as? CrypticLinkWord ?: IgnoredCluePart(it)
            })
        }

        val definitionStep = CrypticClueStructurePart.DefinitionStep(children.map {
            it as? CrypticDefinition ?: IgnoredCluePart(it)
        })

        return CrypticClueStructure(
            listOfNotNull(
                wordplayStep,
                linkWordStep,
                definitionStep,
            )
        )
    }

    override fun getExplanation(): CrypticClueExplanation {

    }
}