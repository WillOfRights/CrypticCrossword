package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueExplanation

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A part of a cryptic clue explanation (either as part of a step or a hint) such as a definition, an indicator,
 * fodder, yielded text, ignored text, etc. Can be serialized as a DTO so it can be passed and rendered on the frontend.
 */
@Serializable
sealed class CrypticClueExplanationPart {
    /**
     * The text that is represented by this part of the explanation (either from part of the clue or a yielded answer).
     */
    abstract val text: String

    /**
     * Whether this is "yielded text" (which will eventually become the answer), and if not, it is assumed to have
     * come from the clue text.
     */
    abstract val isYieldedText: Boolean

    /**
     * Definition in part of an explanation for a cryptic clue.
     */
    @SerialName("CrypticExplanationDefinition")
    data class ExplanationDefinitionPart(override val text: String): CrypticClueExplanationPart() {
        override val isYieldedText = false
    }

    /**
     * Fodder in part of an explanation for a cryptic clue.
     */
    @SerialName("CrypticExplanationFodder")
    data class ExplanationFodderPart(override val text: String): CrypticClueExplanationPart() {
        override val isYieldedText = false
    }

    /**
     * Indicator in part of an explanation for a cryptic clue.
     */
    @SerialName("CrypticExplanationIndicator")
    data class ExplanationIndicatorPart(
        override val text: String,
        val indicatorType: ExplanationIndicatorType)
        : CrypticClueExplanationPart() {
        override val isYieldedText = false
    }

    /**
     * Yielded text in part of an explanation for a cryptic clue.
     */
    @SerialName("CrypticExplanationYield")
    data class ExplanationYieldedPart(
        override val text: String,
        val isYieldedByExplanationStep: Boolean)
        : CrypticClueExplanationPart() {
        override val isYieldedText = true
    }

    /**
     * Ignored text in part of an explanation for a cryptic clue.
     */
    @SerialName("CrypticExplanationIgnored")
    data class ExplanationIgnoredPart(override val text: String): CrypticClueExplanationPart() {
        override val isYieldedText = false
    }

    /**
     * Link word(s) in part of an explanation for a cryptic clue.
     */
    @SerialName("CrypticExplanationLink")
    data class ExplanationLinkPart(override val text: String): CrypticClueExplanationPart() {
        override val isYieldedText = false
    }
}