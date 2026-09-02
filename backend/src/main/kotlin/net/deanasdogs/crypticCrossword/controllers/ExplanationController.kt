package net.deanasdogs.crypticCrossword.controllers.homepage

import net.deanasdogs.crypticCrossword.modules.core.parse.ParseResult
import net.deanasdogs.crypticCrossword.modules.puzzle.api.ClueParser
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticClueExplanation.CrypticClueExplanation
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class ExplanationController(
    @Autowired private val clueParser: ClueParser,
) {
    @GetMapping("/explain")
    fun explanationTest(): CrypticClueExplanation {
        val successResult =
            clueParser.parseCrypticClue(
                "Def1 def2",
                "FOO",
                """{"type": "doubleDefinition", "children":
                        |[
                            |{"type": "definition", "clueText": "Def1", "yield": "FOO"},
                            |{"type": "nonIndicatorText", "clueText": " "},
                            |{"type": "definition", "clueText": "def2", "yield": "FOO", "isPrimaryDefinition": "false"}
                        |]}
                """.trimMargin(),
            ) as ParseResult.Success
        return successResult.value.baseCrypticCluePart.getExplanation()
    }
}