package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.explanationNode

import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanationPart

/**
 * Very thin wrapper on `ExplanationNode`, which enforces that the yielded part is non-null.
 */
abstract class WordplayExplanationNode: ExplanationNode() {
    abstract override fun getAsYieldedPart(): CrypticClueExplanationPart.ExplanationYieldedPart
}