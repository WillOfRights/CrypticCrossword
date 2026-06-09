package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.explanationNode

import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanationPart
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanationStep

/**
 * The purpose of an `ExplanationNode` is as an intermediate step in constructing a `CrypticClueExplanation`.
 * `CrypticClue`s fundamentally have a tree structure, where each part combines child parts to create the whole.
 * In order to create the explanation, we will traverse the tree and explain each node, but it is useful to create a
 * more general data structure to do this. `ExplanationNode` allows for nodes that require 0 or multiple steps to
 * explain and only contains the information needed to create the explanation steps.
 */
abstract class ExplanationNode {

    /**
     * Function to process this `ExplanationNode`.
     */
    abstract fun process(
        /**
         * Function to add an explanation step (if needed any number of times) to the list of explanation steps.
         */
        addExplanationStep: (CrypticClueExplanationStep) -> Nothing,
        /**
         * Takes in a list of `CrypticClueExplanationPart`, and returns the list of explanation parts for the whole rest
         * of the clue. Passed by the parent so that each child is only responsible for the transformation that it
         * needs to reveal for processing.
         */
        constructAsExplanationParts: (List<CrypticClueExplanationPart>) -> List<CrypticClueExplanationPart>)

    /**
     * Get this node as an ignored explanation part (used when this is not the part being revealed).
     */
    abstract fun getAsIgnoredPart(): CrypticClueExplanationPart.ExplanationIgnoredPart


    /**
     * Get this node as a yielded explanation part (or null if it does not yield anything). Referenced by the parent
     * to refer to the answer text that should come from this node after it is processed. However, it may not display
     * this way during the explanation step of the parent (since some parts like fodder are self-explanatory, see
     * `getAsPartConsideredYielded`).
     */
    abstract fun getAsYieldedPart(): CrypticClueExplanationPart.ExplanationYieldedPart?

    /**
     * Get this node as it should display for the final reveal of the whole clue.
     */
    abstract fun getAsFinalRevealedParts(): List<CrypticClueExplanationPart>

    /**
     * Get the parts represented by this clue as they will display after the parent has called `process` on this node,
     * and while the parent is processing itself. While this node will be treated as `getAsYieldedPart` for the purposes
     * of showing how it changes the yielded text, it will display as these nodes. This allows for self-explanatory
     * parts like fodder to not require their own step.
     */
    fun getAsPartsConsideredYielded(): List<CrypticClueExplanationPart> {
        return listOfNotNull(getAsYieldedPart())
    }
}