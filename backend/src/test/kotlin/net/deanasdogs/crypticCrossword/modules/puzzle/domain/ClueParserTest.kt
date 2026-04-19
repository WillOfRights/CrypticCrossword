package net.deanasdogs.crypticCrossword.modules.puzzle.domain

import net.deanasdogs.crypticCrossword.modules.core.parse.ParseResult
import net.deanasdogs.crypticCrossword.modules.puzzle.api.ClueParseError
import net.deanasdogs.crypticCrossword.modules.puzzle.api.ClueParser
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.BaseCrypticCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.CrypticDefinition
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.CrypticDoubleDefinition
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.CrypticNonIndicatorText
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import java.util.stream.Stream

@SpringBootTest
class ClueParserTest(
    @Autowired private val clueParser: ClueParser,
) {
    companion object {
        @JvmStatic
        fun basicIntegrationTestCases(): Stream<Arguments> =
            Stream.of(
                // Double definition
                Arguments.of(
                    "Double definition",
                    "Def1 def2",
                    "FOO",
                    """{"type":"doubleDefinition", "clueText":"Def1 def2", "children":
                        |[
                            |{"type":"definition", "clueText":"Def1", "answerYield": "FOO"},
                            |{"type":"nonIndicatorText", "clueText":" "},
                            |{"type":"definition", "clueText":"Def2", "answerYield": "FOO", "isPrimaryDefinition":"false"}
                        |]}
                    """.trimMargin(),
                    CrypticDoubleDefinition(
                        clueText = "Def1 def2",
                        children =
                            listOf(
                                CrypticDefinition("Def1", "FOO"),
                                CrypticNonIndicatorText(" "),
                                CrypticDefinition("Def2", "FOO", isPrimaryDefinition = false),
                            ),
                    ),
                ),
            )

        fun formatParseErrors(
            testCaseName: String,
            clueText: String,
            answer: String,
            baseCrypticClueJson: String,
            errors: List<ClueParseError>,
        ): String =
            buildString {
                appendLine("Parsing test case $testCaseName")
                appendLine("* Clue text: $clueText")
                appendLine("* Answer: $answer")
                appendLine("* Base JSON: $baseCrypticClueJson")

                appendLine("Encountered the following errors:")
                for (error in errors) {
                    appendLine(error.errorString)
                }
            }
    }

    @ParameterizedTest(name = "Parse {0}")
    @MethodSource("basicIntegrationTestCases")
    fun basicClueIntegrationTests(
        testCaseName: String,
        clueText: String,
        answer: String,
        baseCrypticClueJson: String,
        baseCrypticCluePart: BaseCrypticCluePart,
    ) {
        val parsedClueResult = clueParser.parseCrypticClue(clueText, answer, baseCrypticClueJson)

        Assertions.assertFalse(parsedClueResult is ParseResult.Failure)
            {
                formatParseErrors(
                    testCaseName,
                    clueText,
                    answer,
                    baseCrypticClueJson,
                    (parsedClueResult as ParseResult.Failure).errors,
                )
            }

        val parsedClue = (parsedClueResult as ParseResult.Success).value
        // Trivial checks
        Assertions.assertEquals(parsedClue.clueText, clueText)
        Assertions.assertEquals(parsedClue.answer, answer)

        // Substantive check
        Assertions.assertEquals(parsedClue.baseCrypticCluePart, baseCrypticCluePart)
            { "DTO parsed did not match what was expected by test case." }
    }
}
