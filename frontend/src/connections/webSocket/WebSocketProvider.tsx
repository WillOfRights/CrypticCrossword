import * as React from 'react';

const {createContext, useContext, useState} = React;
import type {ReactNode} from 'react';

import {WebSocketStatus} from "./WebSocketTypes";
import {useWebSocket} from "./WebSocket";

interface WebSocketProviderProps {
    url: string,
    children: ReactNode,
}

const WebSocketContext = createContext(null);

function WebSocketProvider({url, children}: WebSocketProviderProps) {
    const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.CONNECTING);
    const ws = useWebSocket({
        url,
        options: {
            onMessage: () => {},
            onOpen: () => {setStatus(WebSocketStatus.CONNECTED)},
            onClose: () => {setStatus(WebSocketStatus.DISCONNECTED)},
            reconnect: true,
        },
    });

    return (
        <WebSocketContext.Provider value={{ ...ws, status }}>
            {children}
        </WebSocketContext.Provider>
    );
}

function useSocket() {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error("useSocket outside WebSocketProvider");
    return ctx;
}

export {
    WebSocketProvider,
    useSocket,
};
