package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueExplanation

import kotlinx.serialization.Serializable

/**
 * A step in a cryptic clue explanation, can act as a DTO which can be serialized and rendered by the frontend.
 */
@Serializable
data class CrypticClueExplanationStep(
    /**
     * The text that is represented by this step in the explanation (combining the clue and what has been yielded so far).
     */
    val text: String,
    val baseExplanationParts: List<CrypticClueExplanationPart>,
    val yieldedExplanationParts: List<CrypticClueExplanationPart>)
{

    init {
        require(baseExplanationParts.joinToString("") == text) {
            "The text of an explanation step must match the text from each of it's parts."
        }
    }

}
