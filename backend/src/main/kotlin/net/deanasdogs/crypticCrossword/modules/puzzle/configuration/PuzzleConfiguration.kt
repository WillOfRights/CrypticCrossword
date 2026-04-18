package net.deanasdogs.crypticCrossword.modules.puzzle.configuration

import net.deanasdogs.crypticCrossword.modules.puzzle.api.ClueParser
import net.deanasdogs.crypticCrossword.modules.puzzle.domain.ClueParserImpl
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * Configuration for the puzzle module.
 */
@Configuration
class PuzzleConfiguration {
    @Bean
    fun clueParser(): ClueParser = ClueParserImpl()
}
