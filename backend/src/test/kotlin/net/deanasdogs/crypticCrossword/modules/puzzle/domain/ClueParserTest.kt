package net.deanasdogs.crypticCrossword.modules.puzzle.domain

import net.deanasdogs.crypticCrossword.modules.core.parse.ParseResult
import net.deanasdogs.crypticCrossword.modules.puzzle.api.ClueParseError
import net.deanasdogs.crypticCrossword.modules.puzzle.api.ClueParser
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.BaseCrypticCluePart
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.CrypticDefinition
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.CrypticDefinitionAndWordplay
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.CrypticDoubleDefinition
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.CrypticJuxtaposition
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.CrypticJuxtapositionIndicator
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.CrypticLinkWord
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.CrypticNonIndicatorText
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart.CrypticSynonym
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
    /**
     * Basic integration test cases for the functionality of the ClueParser.
     */
    @ParameterizedTest(name = "Parse {0}")
    @MethodSource("basicIntegrationTestCases")
    fun basicClueIntegrationTests(
        testCaseName: String,
        clueText: String,
        answer: String,
        baseCrypticClueJson: String,
        baseCrypticCluePart: BaseCrypticCluePart,
        explanationLength: Int,
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

        // Verify that we can parse into an explanation of the expected length
        val explanation = parsedClue.baseCrypticCluePart.getExplanation()
        Assertions.assertEquals(explanation.explanationSteps.size, explanationLength)
    }

    companion object {
        @JvmStatic
        fun basicIntegrationTestCases(): Stream<Arguments> =
            Stream.of(
                // Double definition
                Arguments.of(
                    "Double definition",
                    "Def1 def2",
                    "FOO",
                    """{"type": "doubleDefinition", "children":
                        |[
                            |{"type": "definition", "clueText": "Def1", "yield": "FOO"},
                            |{"type": "nonIndicatorText", "clueText": " "},
                            |{"type": "definition", "clueText": "def2", "yield": "FOO", "isPrimaryDefinition": "false"}
                        |]}
                    """.trimMargin(),
                    CrypticDoubleDefinition(
                        children =
                            listOf(
                                CrypticDefinition("Def1", "FOO"),
                                CrypticNonIndicatorText(" "),
                                CrypticDefinition("def2", "FOO", isPrimaryDefinition = false),
                            ),
                    ),
                    2,
                ),
                // Double definition with link word
                Arguments.of(
                    "Double definition with link word",
                    "Def1 link def2",
                    "FOO",
                    """{"type": "doubleDefinition", "children":
                        |[
                            |{"type": "definition", "clueText": "Def1", "yield": "FOO"},
                            |{"type": "nonIndicatorText", "clueText": " "},
                            |{"type": "linkWord", "clueText": "link"},
                            |{"type": "nonIndicatorText", "clueText": " "},
                            |{"type": "definition", "clueText": "def2", "yield": "FOO", "isPrimaryDefinition": "false"}
                        |]}
                    """.trimMargin(),
                    CrypticDoubleDefinition(
                        children =
                            listOf(
                                CrypticDefinition("Def1", "FOO"),
                                CrypticNonIndicatorText(" "),
                                CrypticLinkWord("link"),
                                CrypticNonIndicatorText(" "),
                                CrypticDefinition("def2", "FOO", isPrimaryDefinition = false),
                            ),
                    ),
                    2,
                ),
                // Cryptic juxtaposition without indicator
                Arguments.of(
                    "Cryptic juxtaposition",
                    "Def1 placeholder test",
                    "FOOBAR",
                    """{"type": "definitionAndWordplay", "children":
                        |[
                            |{"type": "definition", "clueText": "Def1", "yield": "FOOBAR"},
                            |{"type": "nonIndicatorText", "clueText": " "},
                            |{"type": "crypticJuxtaposition", "children":
                                |[
                                    |{"type": "crypticSynonym", "clueText": "placeholder", "yield": "FOO" },
                                    |{"type": "nonIndicatorText", "clueText": " "},
                                    |{"type": "crypticSynonym", "clueText": "test", "yield": "BAR" }
                            |]}
                        |]}
                    """.trimMargin(),
                    CrypticDefinitionAndWordplay(
                        children =
                            listOf(
                                CrypticDefinition("Def1", "FOOBAR"),
                                CrypticNonIndicatorText(" "),
                                CrypticJuxtaposition(
                                    listOf(
                                        CrypticSynonym("placeholder", "FOO"),
                                        CrypticNonIndicatorText(" "),
                                        CrypticSynonym("test", "BAR"),
                                    ),
                                ),
                            ),
                    ),
                    3, // TODO: Make this 2 when non-indicator juxtapositions do not require a step
                ),
                // Cryptic juxtaposition with indicator
                Arguments.of(
                    "Cryptic juxtaposition with indicator",
                    "Def1 placeholder after test",
                    "BARFOO",
                    """{"type": "definitionAndWordplay", "children":
                        |[
                            |{"type": "definition", "clueText": "Def1", "yield": "BARFOO"},
                            |{"type": "nonIndicatorText", "clueText": " "},
                            |{"type": "crypticJuxtaposition", "children":
                                |[
                                    |{"type": "crypticSynonym", "clueText": "placeholder", "yield": "FOO" },
                                    |{"type": "nonIndicatorText", "clueText": " "},
                                    |{"type": "crypticJuxtapositionIndicator", "clueText": "after", "isBefore": "false"},
                                    |{"type": "nonIndicatorText", "clueText": " "},
                                    |{"type": "crypticSynonym", "clueText": "test", "yield": "BAR" }
                            |]}
                        |]}
                    """.trimMargin(),
                    CrypticDefinitionAndWordplay(
                        children =
                            listOf(
                                CrypticDefinition("Def1", "BARFOO"),
                                CrypticNonIndicatorText(" "),
                                CrypticJuxtaposition(
                                    listOf(
                                        CrypticSynonym("placeholder", "FOO"),
                                        CrypticNonIndicatorText(" "),
                                        CrypticJuxtapositionIndicator("after", false),
                                        CrypticNonIndicatorText(" "),
                                        CrypticSynonym("test", "BAR"),
                                    ),
                                ),
                            ),
                    ),
                    3,
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
}
