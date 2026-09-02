enum WebSocketStatus {
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
}

type UseWebSocketOptions = {
    onMessage: (message: string) => void,
    onOpen: () => void,
    onClose: (event: CloseEvent) => void,
    reconnect: boolean,
};

export {
    WebSocketStatus,
    UseWebSocketOptions,
}