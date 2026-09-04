package net.deanasdogs.crypticCrossword.modules.game.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.dto.PuzzleClueKeyDTO

/**
 * Base class for a message sent from the game server to a client over the game websocket.
 */
@Serializable
sealed class GameServerMessageDTO

/**
 * Sent to a client in direct response to a [net.deanasdogs.crypticCrossword.modules.puzzle.dto.ClueGuessDTO],
 * telling that client whether their guess was correct.
 */
@Serializable
@SerialName("guessResult")
data class GuessResultDTO(
    val puzzleClueKey: PuzzleClueKeyDTO,
    val guess: ClueAnswerFill,
    val isCorrect: Boolean,
) : GameServerMessageDTO()

/**
 * Broadcast to every connected client that a clue has been revealed globally for all solvers.
 */
@Serializable
@SerialName("clueRevealed")
data class ClueRevealedDTO(
    val puzzleClueKey: PuzzleClueKeyDTO,
    val answer: ClueAnswerFill,
) : GameServerMessageDTO()
