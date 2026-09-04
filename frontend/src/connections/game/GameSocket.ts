import * as React from 'react';

const {useCallback, useEffect, useRef} = React;

import {useSocket} from '../webSocket/WebSocketProvider';
import {ClueGuess, ClueGuessType} from '../../schemas/domain/puzzle/ClueGuess';
import {GameServerMessage, GameServerMessageType} from '../../schemas/domain/game/GameServerMessage';

/**
 * Path suffix, relative to the site origin, that the game websocket is served from. Matches
 * `/ws/game` in the backend's `WebSocketConfiguration`.
 */
export const GAME_WS_URL_SUFFIX = 'ws/game';

/**
 * Send-side of the game protocol: returns a function that sends a guess to the server to be
 * checked against a clue's answer.
 */
function useCheckClueGuess() {
    const {send} = useSocket();

    return useCallback((guess: ClueGuessType) => {
        send(ClueGuess.parse(guess));
    }, [send]);
}

/**
 * Receive-side of the game protocol: subscribes `onMessage` to every message the game server
 * sends (guess results and clue reveals) for the lifetime of the calling component.
 */
function useGameMessages(onMessage: (message: GameServerMessageType) => void) {
    const {subscribe} = useSocket();

    // Keep the latest callback in a ref so the subscription effect doesn't need to
    // resubscribe every time the caller passes a new function identity.
    const onMessageRef = useRef(onMessage);
    useEffect(() => {
        onMessageRef.current = onMessage;
    });

    useEffect(() => {
        return subscribe((data: unknown) => {
            const result = GameServerMessage.safeParse(data);
            if (result.success) {
                onMessageRef.current(result.data);
            }
            else {
                console.error('Received malformed game message', data, result.error);
            }
        });
    }, [subscribe]);
}

export {
    useCheckClueGuess,
    useGameMessages,
};
