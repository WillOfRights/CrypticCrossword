package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common

/**
 * A part of a clue that yields letters in the answer. Either a definition or part of wordplay.
 */
interface YieldableCluePart {
    fun getYieldedAnswer(): String
}