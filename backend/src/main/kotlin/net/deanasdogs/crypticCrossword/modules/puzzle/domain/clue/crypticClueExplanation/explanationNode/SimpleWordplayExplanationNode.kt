package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.explanationNode

import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanationPart
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanationStep

/**
 * A basic class to create the simple behavior for an explanation node generated from a wordplay part.
 */
abstract class SimpleWordplayExplanationNode(
    val text: String,
    val childNodes: List<ExplanationNode>,
    val yield: String,
) : WordplayExplanationNode() {
    /**
     * Function which converts processed child clue parts into the total explanation part for this wordplay step. It is
     * assumed that the i-th index of the `childClueParts` argument corresponds with the i-th index of `childNodes`. We
     * expect that most wordplay parts do nothing when being processed than show the indicator word and convert the
     * whole node to the yielded string, so we can re-use this function for all three purposes:
     *   * When processing the child nodes, we can pass the combination of "ignored" (from unprocessed nodes) and "as
     *   parts considered yielded" (from processed nodes) to get the full ExplanationParts for this step.
     *   * When processing this node, we can reuse the function to get the `baseExplanationParts` when we pass all the
     *   yielded nodes and `revealOwnIndicator` is true
     *   * When doing the final revealed parts, we simply need to reveal its own indicator and pass the result of all
     *   the revealed parts from the children.
     */
    abstract fun localConstructAsExplanationParts(
        childClueParts: List<List<CrypticClueExplanationPart>>,
        revealOwnIndicator: Boolean,
    ): List<CrypticClueExplanationPart>

    override fun process(
        addExplanationStep: (CrypticClueExplanationStep) -> Unit,
        constructAsExplanationParts: (List<CrypticClueExplanationPart>) -> List<CrypticClueExplanationPart>,
    ) {
        // First, process the child nodes in order
        processChildren(addExplanationStep, constructAsExplanationParts)

        // Then, get the base explanation parts and yielded explanation parts that explain this node
        val baseExplanationParts =
            constructAsExplanationParts(
                localConstructAsExplanationParts(
                    childNodes.map { it.getAsPartsConsideredYielded() },
                    true,
                ),
            )
        val yieldedExplanationParts =
            constructAsExplanationParts(
                listOf(CrypticClueExplanationPart.ExplanationYieldedPart(yield, true)),
            )

        // Then, add this as an explanation step to complete processing this node
        addExplanationStep(
            CrypticClueExplanationStep(
                baseExplanationParts.map { it.text }.joinToString(""),
                baseExplanationParts,
                yieldedExplanationParts,
            ),
        )
    }

    override fun getAsIgnoredPart(): CrypticClueExplanationPart.ExplanationIgnoredPart =
        CrypticClueExplanationPart.ExplanationIgnoredPart(text)

    override fun getAsYieldedPart(): CrypticClueExplanationPart.ExplanationYieldedPart =
        CrypticClueExplanationPart.ExplanationYieldedPart(yield, true)

    override fun getAsFinalRevealedParts(): List<CrypticClueExplanationPart> =
        localConstructAsExplanationParts(
            childNodes.map {
                it.getAsFinalRevealedParts()
            },
            true,
        )

    /**
     * Helper function to process the child nodes.
     */
    fun processChildren(
        addExplanationStep: (CrypticClueExplanationStep) -> Unit,
        constructAsExplanationParts: (List<CrypticClueExplanationPart>) -> List<CrypticClueExplanationPart>,
    ) {
        // Iterate through the children nodes, and process them while providing the necessary functions
        for (i in childNodes.indices) {
            // Create the function for the child to be able to add ExplanationParts for the rest of the clue
            val childConstructFunction = { childExplanationParts: List<CrypticClueExplanationPart> ->
                val childList: List<List<CrypticClueExplanationPart>> =
                    childNodes.withIndex().map { (nodeIndex, explanationNode) ->
                        if (nodeIndex < i) {
                            // Node has already been processed, so it is considered as yielded
                            explanationNode.getAsPartsConsideredYielded()
                        } else if (nodeIndex == i) {
                            // Part we are currently processing, so the argument is passed up
                            childExplanationParts
                        } else {
                            // Node has yet to be processed, so we consider it an ignored part
                            listOf(explanationNode.getAsIgnoredPart())
                        }
                    }
                constructAsExplanationParts(
                    localConstructAsExplanationParts(childList, false),
                )
            }

            // Process this child node
            childNodes[i].process(addExplanationStep, childConstructFunction)
        }
    }
}
