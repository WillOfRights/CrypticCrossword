package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation

import kotlinx.serialization.Serializable

/**
 * The full explanation of a cryptic clue, can act as a DTO which can be serialized and rendered by the frontend.
 */
@Serializable
data class CrypticClueExplanation(
    val clueText: String,
    val explanationSteps: List<CrypticClueExplanationStep>,
    val answer: String)
{
    init {
        require(explanationSteps.isNotEmpty()) { "Explanation cannot have empty explanation steps."}
        require(explanationSteps[0].text == clueText) {
            "The first step of the explanation must have the same text as the clue text."
        }
        for (i in 0 until explanationSteps.size - 1) {
            require( explanationSteps[i].isResetStep
                    || CrypticClueExplanationUtils.isYieldRelation(explanationSteps[i], explanationSteps[i + 1])) {
                "Explanation part $i is not compatible with explanation part ${i+1}."
            }
        }
    }
}



