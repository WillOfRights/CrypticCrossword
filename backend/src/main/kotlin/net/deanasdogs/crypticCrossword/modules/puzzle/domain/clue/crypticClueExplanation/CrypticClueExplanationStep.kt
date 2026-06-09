package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation

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
    val yieldedExplanationParts: List<CrypticClueExplanationPart>,
    /**
     * Occasionally at the end, we reset to the full clue text rather than the yielded text. This occurs at the end of
     * a clue to show the full clue again, or in an &lit to reveal the whole clue is the definition. Therefore, this is
     * the only case where the explanation step is not compatible with the next step.
     */
    val isResetStep: Boolean = false)
{

    init {
        require(baseExplanationParts.joinToString("") == text) {
            "The text of an explanation step must match the text from each of it's parts."
        }
    }

}
