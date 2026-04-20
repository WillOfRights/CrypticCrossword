package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common

/**
 * A part of a clue that yields letters which may be used in part of the answer. Either a definition or part of wordplay.
 */
interface YieldableCluePart {
    /**
     * Get the letters yielded by this clue part.
     */
    fun getYield(): String
}