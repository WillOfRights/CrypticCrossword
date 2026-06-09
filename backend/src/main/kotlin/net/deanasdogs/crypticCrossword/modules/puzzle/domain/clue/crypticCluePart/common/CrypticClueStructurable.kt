package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.common

import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueStructure.CrypticClueStructure

/**
 * An interface indicating that there is a cryptic clue structure (definitions, wordplay) representing the clue that
 * is based at this part.
 */
interface CrypticClueStructurable {
    fun getCrypticClueStructure(): CrypticClueStructure
}