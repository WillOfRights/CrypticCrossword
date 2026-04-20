package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueStructure

import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.CrypticCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.CrypticDefinition
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.IgnoredCluePart

/**
 * A part of the full structure of a cryptic clue: such as a definition, wordplay, or a link word.
 */
sealed class CrypticClueStructurePart() {
    abstract val crypticClueParts: List<CrypticCluePart>

    data class DefinitionStep(override val crypticClueParts: List<CrypticCluePart>): CrypticClueStructurePart() {
        init {
            require(crypticClueParts
                .all {
                    crypticCluePart -> crypticCluePart is CrypticDefinition || crypticCluePart is IgnoredCluePart
                }
            ) {
                "All parts of a definition step must be a definition or an ignored clue part."
            }
        }
    }
}
