package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.explanationNode.ExplanationNode
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.explanationNode.WordplayExplanationNode
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common.YieldableCluePart

/**
 * A wordplay part of a cryptic clue.
 */
@Serializable
sealed class CrypticWordplay: CrypticCluePart(), YieldableCluePart {
    /**
     * All wordplay parts can recursively create a wordplay explanation node.
     */
    abstract fun getWordplayExplanationNode(): WordplayExplanationNode
}