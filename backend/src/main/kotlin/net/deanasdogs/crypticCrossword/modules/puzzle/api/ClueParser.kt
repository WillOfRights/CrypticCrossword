package net.deanasdogs.crypticCrossword.modules.puzzle.api

import net.deanasdogs.crypticCrossword.modules.core.parse.ParseResult
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.CrypticClue

/**
 * Abstract interface to convert clues to relevant models and DTOs.
 */
interface ClueParser {
    fun parseCrypticClue(
        clueText: String,
        answer: String,
        baseCrypticClueJson: String,
    ): ParseResult<CrypticClue, ClueParseError>
}
