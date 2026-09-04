import * as React from 'react';

const {createContext, useContext, useState, useRef, useCallback} = React;
import type {ReactNode} from 'react';

import {WebSocketContextValue, WebSocketStatus, MessageListener} from "./WebSocketTypes";
import {useWebSocket} from "./WebSocket";

interface WebSocketProviderProps {
    url: string,
    children: ReactNode,
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

/**
 * Provides a single shared websocket connection to the whole app.
 */
function WebSocketProvider({url, children}: WebSocketProviderProps) {
    const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.CONNECTING);
    const listenersRef = useRef<Set<MessageListener>>(new Set());

    const subscribe = useCallback((listener: MessageListener) => {
        listenersRef.current.add(listener);
        return () => {
            listenersRef.current.delete(listener);
        };
    }, []);

    const ws = useWebSocket({
        url,
        options: {
            onMessage: (data: unknown) => {
                listenersRef.current.forEach((listener) => listener(data));
            },
            onOpen: () => {setStatus(WebSocketStatus.CONNECTED)},
            onClose: () => {setStatus(WebSocketStatus.DISCONNECTED)},
            reconnect: true,
        },
    });

    return (
        <WebSocketContext.Provider value={{ send: ws.send, status, subscribe }}>
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
