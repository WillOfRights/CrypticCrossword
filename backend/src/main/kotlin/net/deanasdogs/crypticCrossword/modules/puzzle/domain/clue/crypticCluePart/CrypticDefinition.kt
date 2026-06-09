package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common.YieldableCluePart

/**
 * A definition in a cryptic clue.
 */
@Serializable
@SerialName("definition")
data class CrypticDefinition(
    override val clueText: String,
    override val yield: String,
    val isPrimaryDefinition: Boolean = true,
) : CrypticCluePart(), YieldableCluePart {
}
