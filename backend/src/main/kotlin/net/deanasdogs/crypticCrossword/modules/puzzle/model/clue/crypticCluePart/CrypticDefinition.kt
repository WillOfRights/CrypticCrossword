package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A definition in a cryptic clue.
 */
@Serializable
@SerialName("definition")
data class CrypticDefinition(
    override val clueText: String,
    val isPrimaryDefinition: Boolean = true,
) : CrypticCluePart()
