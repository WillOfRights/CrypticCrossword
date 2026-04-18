package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue

import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.BaseCrypticCluePart

/**
 * A solvable clue with clue text, solution, explanation, and hint information.
 */
class CrypticClue(
    val clueText: String,
    val answer: String,
    val baseCrypticCluePart: BaseCrypticCluePart,
)
