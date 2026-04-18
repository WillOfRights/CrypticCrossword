package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticClueStructure

/**
 * The structure of a cryptic clue, breaking down the clue into the distinct parts that each clue the answer (or are
 * link words).
 */
data class CrypticClueStructure(val structureParts: List<CrypticClueStructurePart>)
