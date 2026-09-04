package net.deanasdogs.crypticCrossword.modules.game.dto

import kotlinx.serialization.Serializable

/**
 * A string representing answer filled in a clue, whether being guessed by the user or revealed as the answer.
 */
@JvmInline
@Serializable
value class ClueAnswerFill(val guess: String)