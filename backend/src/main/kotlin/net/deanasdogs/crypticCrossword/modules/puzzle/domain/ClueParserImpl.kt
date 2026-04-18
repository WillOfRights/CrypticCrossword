package net.deanasdogs.crypticCrossword.modules.puzzle.domain

import kotlinx.serialization.json.Json
import net.deanasdogs.crypticCrossword.modules.core.parse.ParseResult
import net.deanasdogs.crypticCrossword.modules.puzzle.api.ClueParseError
import net.deanasdogs.crypticCrossword.modules.puzzle.api.ClueParser
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.CrypticClue
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.BaseCrypticCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.CrypticClueStructurable

/**
 * Default implementation of clue parser. Parses clue from db into CrypticClue model and into DTOs for frontend.
 */
class ClueParserImpl : ClueParser {
    override fun parseCrypticClue(
        clueText: String,
        answer: String,
        baseCrypticClueJson: String,
    ): ParseResult<CrypticClue, ClueParseError> {
        val errors = mutableListOf<ClueParseError>()

        val baseCrypticCluePart = Json.decodeFromString<BaseCrypticCluePart>(baseCrypticClueJson)
        if (clueText != baseCrypticCluePart.clueText) {
            errors.add(
                ClueParseError("Clue text derived from cryptic clue parts must match serialized clueText"),
            )
        }

        if (baseCrypticCluePart !is CrypticClueStructurable) {
            errors.add(
                ClueParseError("Top level cryptic clue part must be structurable")
            )
        }

        if (!errors.isEmpty()) {
            return ParseResult.Failure(errors)
        }

        return ParseResult.Success(CrypticClue(clueText, answer, baseCrypticCluePart))
    }
}
