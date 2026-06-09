package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueExplanation.explanationNode

import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueExplanation.CrypticClueExplanationPart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueExplanation.CrypticClueExplanationStep

/**
 * A basic class to create the simple behavior for an explanation node generated from a wordplay part.
 */
abstract class SimpleWordplayExplanationNode(
    val text: String,
    val childNodes: List<ExplanationNode>,
    val yield: String,
    ): WordplayExplanationNode() {

    /**
     * Function which converts processed child clue parts into the total explanation part for this wordplay step. It is
     * assumed that the i-th index of the `childClueParts` argument corresponds with the i-th index of `childNodes`. On
     * `isOwnProcessStep` (this node itself is getting processed), we expect that most wordplay parts will simply
     * show the indicator word and convert the whole node to the yielded string, so we can re-use this function for all
     * three purposes:
     *   * When processing the child nodes, we can pass the combination of "ignored" (from unprocessed nodes) and "as
     *   parts considered yielded" (from processed nodes) to get the full ExplanationParts for this step.
     *   * When processing this node, we can reuse the function to get the `baseExplanationParts`.
     *   * When doing the final revealed parts, we expect that
     */
    abstract fun localConstructAsExplanationParts(
        childClueParts: List<List<CrypticClueExplanationPart>>,
        isOwnProcessStep: Boolean,
        ): List<CrypticClueExplanationPart>

    override fun process(
        addExplanationStep: (CrypticClueExplanationStep) -> Nothing,
        constructAsExplanationParts: (List<CrypticClueExplanationPart>) -> List<CrypticClueExplanationPart>
    ) {
        // First, process the child nodes in order
        processChildren(addExplanationStep, constructAsExplanationParts)
    }

    override fun getAsIgnoredPart(): CrypticClueExplanationPart.ExplanationIgnoredPart {
        return CrypticClueExplanationPart.ExplanationIgnoredPart(text)
    }

    override fun getAsYieldedPart(): CrypticClueExplanationPart.ExplanationYieldedPart {
        return CrypticClueExplanationPart.ExplanationYieldedPart(yield, true)
    }

    override fun getAsFinalRevealedParts(): List<CrypticClueExplanationPart> {
        TODO("Not yet implemented")
    }

    /**
     * Helper function to process the child nodes.
     */
    fun processChildren(
        addExplanationStep: (CrypticClueExplanationStep) -> Nothing,
        constructAsExplanationParts: (List<CrypticClueExplanationPart>) -> List<CrypticClueExplanationPart>
    ) {
        // Iterate through the children nodes, and process them while providing the necessary functions
        for (i in childNodes.indices) {
            // Create the function for the child to be able to add ExplanationParts for the rest of the clue
            val childConstructFunction = { childExplanationParts: List<CrypticClueExplanationPart> ->
                val childList: List<List<CrypticClueExplanationPart>> = childNodes.withIndex().map {
                        (nodeIndex, explanationNode) ->
                    if (nodeIndex < i) {
                        // Node has already been processed, so it is considered as yielded
                        explanationNode.getAsPartsConsideredYielded()
                    }
                    else if (nodeIndex == i) {
                        // Part we are currently processing, so the argument is passed up
                        childExplanationParts
                    }
                    else {
                        // Node has yet to be processed, so we consider it an ignored part
                        listOf(explanationNode.getAsIgnoredPart())
                    }
                }
                constructAsExplanationParts(
                    localConstructAsExplanationParts(childList, false)
                )
            }

            // Process this child node
            childNodes[i].process(addExplanationStep, childConstructFunction)
        }
    }
}