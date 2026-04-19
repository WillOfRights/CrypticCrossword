package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.YieldableCluePart

/**
 * A definition in a cryptic clue.
 */
@Serializable
@SerialName("definition")
data class CrypticDefinition(
    override val clueText: String,
    val answerYield: String,
    val isPrimaryDefinition: Boolean = true,
) : CrypticCluePart(), YieldableCluePart {
    override fun getYieldedAnswer(): String {
        return answerYield
    }
}
