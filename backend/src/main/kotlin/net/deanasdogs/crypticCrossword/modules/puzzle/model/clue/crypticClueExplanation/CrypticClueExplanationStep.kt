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



    /**
     * Each step in a cryptic clue explanation yields the next step (except for the final step). Rather than use a
     * linked list structure, we create a reusable function to check if the text yielded by this step is indeed
     * compatible with the next step. This returns true if the result of merging all the clue and yield parts in the
     * yieldedExplanationParts is the result of doing the same on the baseExplanationParts for the next step (but not
     * combining parts from the clue vs. yield, which are not compatible as we are converting the clue into the yield
     * as part of each step).
     */
    fun yields(that: CrypticClueExplanationStep): Boolean {
        return mergeExplanationParts(yieldedExplanationParts) == mergeExplanationParts(that.baseExplanationParts)
    }

    /**
     * Helper function to merge CrypticClueExplanationParts
     */
    private fun mergeExplanationParts(explanationParts: List<CrypticClueExplanationPart>)
        : List<MergeableExplanationPart>
    {
        val mergedExplanationParts = mutableListOf<MergeableExplanationPart>()
        val mergingStringBuilder: StringBuilder = StringBuilder()
        var mergingExplanationPartType: MergeableExplanationPartType? = null

        /**
         * Flush the part we are currently merging, and reset the string builder.
         */
        fun flush(flushingYieldPart: Boolean) {
            if (flushingYieldPart) {
                mergedExplanationParts.add(MergedCluePart(mergingStringBuilder.toString()))
                mergingExplanationPartType = MergeableExplanationPartType.YIELD_PART
                mergingStringBuilder.clear()
            }
            else {
                mergedExplanationParts.add(MergedYieldPart(mergingStringBuilder.toString()))
                mergingExplanationPartType = MergeableExplanationPartType.YIELD_PART
                mergingStringBuilder.clear()
            }
        }

        for (explanationPart in explanationParts) {
            when (mergingExplanationPartType) {
                null -> {
                    // If this is the first object we encounter, initialize the string builder and set the type
                    // that we are currently merging
                    mergingStringBuilder.append(explanationPart.text)
                    mergingExplanationPartType =
                        if (explanationPart.isYieldedText) MergeableExplanationPartType.YIELD_PART
                        else MergeableExplanationPartType.CLUE_PART
                }

                MergeableExplanationPartType.CLUE_PART ->  {
                    // If we are currently merging clue parts but encounter a yield part, flush
                    if (explanationPart.isYieldedText) {
                        flush(true)
                    }
                    mergingStringBuilder.append(explanationPart.text)
                }

                MergeableExplanationPartType.YIELD_PART ->  {
                    // If we are currently merging yield parts but encounter a clue part, flush
                    if (!explanationPart.isYieldedText) {
                        flush(false)
                    }
                    mergingStringBuilder.append(explanationPart.text)
                }
            }
        }

        // Append the final element
        mergingExplanationPartType?.let { flush(it == MergeableExplanationPartType.CLUE_PART) }

        return mergedExplanationParts
    }

    companion object {

        enum class MergeableExplanationPartType {
            CLUE_PART,
            YIELD_PART,
        }
        interface MergeableExplanationPart
        @JvmInline
        value class MergedCluePart(val text: String) : MergeableExplanationPart
        @JvmInline
        value class MergedYieldPart(val text: String) : MergeableExplanationPart
    }
}
