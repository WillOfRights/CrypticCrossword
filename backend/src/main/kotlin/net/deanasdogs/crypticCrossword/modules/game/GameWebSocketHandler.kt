package net.deanasdogs.crypticCrossword.modules.game

import kotlinx.serialization.json.Json
import net.deanasdogs.crypticCrossword.modules.puzzle.dto.ClueDirectionDTO
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

class GameWebSocketHandler : TextWebSocketHandler() {
    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        val direction = Json.decodeFromString<ClueDirectionDTO>(message.payload)
        session.sendMessage(TextMessage(if (direction == ClueDirectionDTO.DOWN) "true" else "false"))
    }
}