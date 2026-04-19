package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.ParentListPart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.YieldableCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueStructure.CrypticClueStructure

/**
 * Standard cryptic clue structure, a wordplay part and a definition part.
 */
@Serializable
@SerialName("definitionAndWordplay")
data class CrypticDefinitionAndWordplay(override val clueText: String, override val children: List<CrypticCluePart>)
    : BaseCrypticCluePart(), ParentListPart
{
    /**
     * Allowed predicates for children.
     */
    override val allowedChildPredicateMap = mapOf(
        // One wordplay and one definition part
        {
            crypticCluePart: CrypticCluePart ->
            !(crypticCluePart is CrypticDefinition
                    || crypticCluePart is CrypticNonIndicatorText
                    || crypticCluePart is CrypticWordplay)
        } to ParentListPart.Companion.AllowedChildPredicateType.NONE,

        // Must be exactly one definition, which is therefore the primary definition
        {
            crypticCluePart: CrypticCluePart ->
            (crypticCluePart is CrypticDefinition && crypticCluePart.isPrimaryDefinition)
        } to ParentListPart.Companion.AllowedChildPredicateType.ONE,

        // Must be exactly one root wordplay part
        {
            crypticCluePart: CrypticCluePart ->
            (crypticCluePart is CrypticWordplay)
        } to ParentListPart.Companion.AllowedChildPredicateType.ONE,
    )

    override fun getCrypticClueStructure(): CrypticClueStructure {
        TODO("Not yet implemented")
    }
}