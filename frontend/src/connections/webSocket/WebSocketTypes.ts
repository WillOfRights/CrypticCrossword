enum WebSocketStatus {
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
}

type UseWebSocketOptions = {
    onMessage: (message: unknown) => void,
    onOpen: () => void,
    onClose: (event: CloseEvent) => void,
    reconnect: boolean,
};

/**
 * Called with every message received on the socket. Returned by `WebSocketContextValue.subscribe`
 * as an unsubscribe function.
 */
type MessageListener = (data: unknown) => void;

/**
 * Context value exposed by `WebSocketProvider`, consumed via `useSocket()`.
 */
interface WebSocketContextValue {
    /**
     * Function for a receiver to send data via the websocket.
     */
    send: (data: unknown) => void,
    /**
     * Status of the websocket for receivers.
     */
    status: WebSocketStatus,
    /**
     * Registers a listener called with every message received on the socket and returns an unsubscribe function.
     */
    subscribe: (listener: MessageListener) => () => void,
}

export {
    WebSocketStatus,
    UseWebSocketOptions,
    MessageListener,
    WebSocketContextValue,
}