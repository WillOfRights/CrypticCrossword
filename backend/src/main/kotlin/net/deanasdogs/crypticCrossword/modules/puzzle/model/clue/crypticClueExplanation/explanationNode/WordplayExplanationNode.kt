package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueExplanation.explanationNode

import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueExplanation.CrypticClueExplanationPart

/**
 * Very thin wrapper on `ExplanationNode`, which enforces that the yielded part is non-null.
 */
abstract class WordplayExplanationNode: ExplanationNode() {
    abstract override fun getAsYieldedPart(): CrypticClueExplanationPart.ExplanationYieldedPart
}