import {useCallback, useEffect, useRef,} from "react";
import {UseWebSocketOptions} from "./WebSocketTypes";

interface UseWebSocketProps {
    url: string,
    options: UseWebSocketOptions,
}

const defaultOptions: UseWebSocketOptions = {
    onMessage: () => {},
    onOpen: () => {},
    onClose: CloseEvent => {},
    reconnect: true,
};

/**
 * Custom useWebSocket hook. See https://websocket.org/guides/frameworks/react/#custom-hook-usewebsocket, adapted for
 * typed React.
 */
function useWebSocket({url, options = defaultOptions} : UseWebSocketProps) {
    const {onMessage, onOpen, onClose, reconnect} = options;
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const attemptRef = useRef(0);

    const connect = useCallback(() => {
        const socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => {
            attemptRef.current = 0;
            onOpen();
        };

        socket.onmessage = (event) => {
            onMessage(JSON.parse(event.data));
        };

        socket.onclose = (event) => {
            onClose(event);
            if (reconnect && event.code !== 1000) {
                scheduleReconnect();
            }
        };

        socket.onerror = () => socket.close();
    }, [url, onMessage, onOpen, onClose, reconnect]);

    const scheduleReconnect = useCallback(() => {
        const attempt = attemptRef.current;
        if (attempt >= 10) return; // stop after 10 attempts

        const baseDelay = Math.min(1000 * 2 ** attempt, 30000);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;

        reconnectTimer.current = setTimeout(() => {
            attemptRef.current += 1;
            connect();
        }, delay);
    }, [connect]);

    useEffect(() => {
        connect();
        return () => {
            clearTimeout(reconnectTimer.current);
            wsRef.current?.close(1000, "hook cleanup");
        };
    }, [connect]);

    const send = useCallback((data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);

    return { send, wsRef };
}

export {
    useWebSocket,
};