package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common

import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanation

/**
 * Interface representing that it is possible to create a cryptic clue explanation from the clue represented.
 */
interface CrypticClueExplainable {
    fun getExplanation(): CrypticClueExplanation
}