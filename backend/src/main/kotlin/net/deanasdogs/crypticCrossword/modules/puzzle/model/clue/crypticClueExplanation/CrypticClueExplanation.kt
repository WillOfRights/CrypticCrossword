package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueExplanation

import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.CrypticClueExplanationHelper

/**
 * The full explanation of a cryptic clue, can act as a DTO which can be serialized and rendered by the frontend.
 */
@Serializable
data class CrypticClueExplanation(
    val clueText: String,
    val explanationParts: List<CrypticClueExplanationStep>,
    val answer: String)
{
    init {
        require(explanationParts.isNotEmpty()) { "Explanation cannot have empty explanation parts."}
        require(explanationParts[0].text == clueText) {
            "The first part of the explanation start with the same text as the clue text."
        }
        for (i in 0 until explanationParts.size - 1) {
            require(CrypticClueExplanationHelper.isYieldRelation(explanationParts[i], explanationParts[i + 1])) {
                "Explanation part $i is not compatible with explanation part ${i+1}."
            }
        }
    }
}



