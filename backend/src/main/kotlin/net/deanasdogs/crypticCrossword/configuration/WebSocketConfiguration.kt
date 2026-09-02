package net.deanasdogs.crypticCrossword.configuration

import net.deanasdogs.crypticCrossword.modules.game.GameWebSocketHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
class WebSocketConfiguration : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(gameHandler(), "/ws/game")
    }

    @Bean
    fun gameHandler(): WebSocketHandler {
        return GameWebSocketHandler()
    }
}