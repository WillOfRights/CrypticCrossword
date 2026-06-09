package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation

/**
 * An object with common utilities for creating and manipulating `CrypticClueExplanation`s.
 */
object CrypticClueExplanationHelper {
    /**
     * Private enum for merging explanation part types based on clue vs. yield parts.
     */
    private enum class MergeableExplanationPartType {
        CLUE_PART,
        YIELD_PART,
    }

    /**
     * Private interface for the two different types of mergeable objects.
     */
    private interface MergeableExplanationPart
    private data class MergedCluePart(val text: String) : MergeableExplanationPart
    private data class MergedYieldPart(val text: String) : MergeableExplanationPart

    /**
     * Each step in a cryptic clue explanation yields the next step (except for the final step). Rather than use a
     * linked list structure, we create a reusable function to check if the text yielded by each step is indeed
     * compatible with the next step. They are compatible if the result of merging all the clue and yield parts in the
     * `yieldedExplanationPart`s is the result of doing the same on the `baseExplanationPart`s for the next step (but
     * not combining parts from the clue vs. yield, which are not compatible as we are converting the clue into the
     * yield as part of each step).
     *
     * @return `true` iff first is compatible with second via the relation mentioned above.
     */
    fun isYieldRelation(first: CrypticClueExplanationStep, second: CrypticClueExplanationStep): Boolean {
        return mergeExplanationParts(first.yieldedExplanationParts) ==
                mergeExplanationParts(second.baseExplanationParts)
    }

    /**
     * Helper function to merge `CrypticClueExplanationPart`s based on the criteria that we want to merge all clue
     * parts and yield parts.
     */
    private fun mergeExplanationParts(explanationParts: List<CrypticClueExplanationPart>)
            : List<MergeableExplanationPart>
    {
        val mergedExplanationParts = mutableListOf<MergeableExplanationPart>()
        val mergingStringBuilder: StringBuilder = StringBuilder()
        var mergingExplanationPartType: MergeableExplanationPartType? = null

        /**
         * Flush the part we are currently merging, set the type we are currently merging to the opposite
         * `MergeableExplanationPartType` and reset the string builder.
         */
        fun flush(isFlushingYieldPart: Boolean) {
            if (isFlushingYieldPart) {
                mergedExplanationParts.add(MergedCluePart(mergingStringBuilder.toString()))
                mergingExplanationPartType = MergeableExplanationPartType.YIELD_PART
                mergingStringBuilder.clear()
            }
            else {
                mergedExplanationParts.add(MergedYieldPart(mergingStringBuilder.toString()))
                mergingExplanationPartType = MergeableExplanationPartType.CLUE_PART
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

}