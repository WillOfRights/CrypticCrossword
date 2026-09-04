package net.deanasdogs.crypticCrossword.modules.game

import kotlinx.serialization.json.Json
import net.deanasdogs.crypticCrossword.modules.game.dto.ClueAnswerFill
import net.deanasdogs.crypticCrossword.modules.game.dto.ClueRevealedDTO
import net.deanasdogs.crypticCrossword.modules.game.dto.GameServerMessageDTO
import net.deanasdogs.crypticCrossword.modules.game.dto.GuessResultDTO
import net.deanasdogs.crypticCrossword.modules.puzzle.dto.ClueDirectionDTO
import net.deanasdogs.crypticCrossword.modules.puzzle.dto.ClueGuessDTO
import net.deanasdogs.crypticCrossword.modules.puzzle.dto.PuzzleClueKeyDTO
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

/**
 * Per-connection bookkeeping for a client of the game websocket. Tracking [lastGuessAt]
 * alongside the session leaves room to rate-limit or time out a client sending guesses too
 * quickly, without otherwise reworking how sessions are tracked.
 */
private class GameSession(val session: WebSocketSession) {
    @Volatile
    var lastGuessAt: Instant? = null
}

/**
 * Proof-of-concept handler for the shared-puzzle game. Owns answer-checking and per-clue solver
 * counts so clients are never trusted with either: a guess is checked against a hardcoded answer
 * key and answered only to the sender, while a clue's answer is broadcast to every connected
 * client once [REVEAL_THRESHOLD] sessions have independently guessed it correctly.
 *
 * State is entirely in-memory and process-lifetime, matching the session-scoped POC game
 * described in the project's CLAUDE.md - there is no persistence layer yet.
 */
class GameWebSocketHandler : TextWebSocketHandler() {
    companion object {
        /** Number of independent correct guesses needed before a clue's answer is revealed to everyone. */
        private const val REVEAL_THRESHOLD = 3

        /** Hardcoded answer key standing in for real puzzle data until persistence exists. */
        private val ANSWER_KEY: Map<PuzzleClueKeyDTO, String> = mapOf(
            PuzzleClueKeyDTO(ClueDirectionDTO.ACROSS, 1) to "DOG",
            PuzzleClueKeyDTO(ClueDirectionDTO.ACROSS, 4) to "OWE",
            PuzzleClueKeyDTO(ClueDirectionDTO.ACROSS, 5) to "MID",
            PuzzleClueKeyDTO(ClueDirectionDTO.ACROSS, 7) to "IS",
            PuzzleClueKeyDTO(ClueDirectionDTO.ACROSS, 8) to "ACE",
            PuzzleClueKeyDTO(ClueDirectionDTO.DOWN, 1) to "DIM",
            PuzzleClueKeyDTO(ClueDirectionDTO.DOWN, 2) to "GOD",
            PuzzleClueKeyDTO(ClueDirectionDTO.DOWN, 3) to "ME",
            PuzzleClueKeyDTO(ClueDirectionDTO.DOWN, 6) to "INC",
        )
    }

    private val sessions = ConcurrentHashMap<String, GameSession>()
    private val solvedBy = ConcurrentHashMap<PuzzleClueKeyDTO, MutableSet<String>>()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        sessions[session.id] = GameSession(session)
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        sessions.remove(session.id)
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        val guess = Json.decodeFromString<ClueGuessDTO>(message.payload)
        sessions[session.id]?.lastGuessAt = Instant.now()

        val clueKey = PuzzleClueKeyDTO(guess.direction, guess.clueNumber)
        val answer = ANSWER_KEY[clueKey]
        val correct = answer != null && answer.equals(guess.guess, ignoreCase = true)

        sendTo(session, GuessResultDTO(clueKey, ClueAnswerFill(guess.guess), correct))

        if (!correct) {
            return
        }

        val solvers = solvedBy.computeIfAbsent(clueKey) { ConcurrentHashMap.newKeySet() }
        solvers.add(session.id)
        if (solvers.size >= REVEAL_THRESHOLD) {
            broadcast(ClueRevealedDTO(clueKey, ClueAnswerFill(answer)))
        }
    }

    private fun sendTo(session: WebSocketSession, message: GameServerMessageDTO) {
        if (session.isOpen) {
            session.sendMessage(TextMessage(Json.encodeToString(GameServerMessageDTO.serializer(), message)))
        }
    }

    private fun broadcast(message: GameServerMessageDTO) {
        val payload = TextMessage(Json.encodeToString(GameServerMessageDTO.serializer(), message))
        sessions.values.forEach { if (it.session.isOpen) it.session.sendMessage(payload) }
    }
}