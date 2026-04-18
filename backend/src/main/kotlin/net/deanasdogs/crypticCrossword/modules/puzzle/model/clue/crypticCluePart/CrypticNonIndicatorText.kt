package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


/**
 * Part of a cryptic clue that is not wordplay or a definition. Usually this is small text or symbols that are ignored
 * in the full clue.
 */
@Serializable
@SerialName("nonIndicatorText")
data class CrypticNonIndicatorText(
    override val clueText: String,
) : CrypticCluePart()
