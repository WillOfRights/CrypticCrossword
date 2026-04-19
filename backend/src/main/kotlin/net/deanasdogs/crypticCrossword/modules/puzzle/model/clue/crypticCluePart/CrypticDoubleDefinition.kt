package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.ParentListPart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueStructure.CrypticClueStructure

@Serializable
@SerialName("doubleDefinition")
data class CrypticDoubleDefinition(override val clueText: String, override val children: List<CrypticCluePart>)
    : BaseCrypticCluePart(), ParentListPart
{
    /**
     * Allowed predicates for children.
     */
    override val allowedChildPredicateMap = mapOf(
        // Only definitions and non-indicator text allowed
        {
            crypticCluePart: CrypticCluePart ->
            !(crypticCluePart is CrypticDefinition || crypticCluePart is CrypticNonIndicatorText)
        } to ParentListPart.Companion.AllowedChildPredicateType.NONE,

        // Must be exactly one primary definition
        {
            crypticCluePart: CrypticCluePart ->
            (crypticCluePart is CrypticDefinition && crypticCluePart.isPrimaryDefinition)
        } to ParentListPart.Companion.AllowedChildPredicateType.ONE,

        // Must be exactly one secondary definition
        {
            crypticCluePart: CrypticCluePart ->
            (crypticCluePart is CrypticDefinition && !crypticCluePart.isPrimaryDefinition)
        } to ParentListPart.Companion.AllowedChildPredicateType.ONE,
    )

    init {
        validateChildClueParts()
    }
    override fun getCrypticClueStructure(): CrypticClueStructure {
        TODO("Not yet implemented")
    }

}