import { createRoot } from 'react-dom/client';
import * as React from 'react';

import HomePageBody from '../homePage/HomePageBody';
import {WebSocketProvider} from "../connections/webSocket/WebSocketProvider";
import {getWsUrl} from "../connections/webSocket/WebSocketUtils";
import {GAME_WS_URL_SUFFIX} from "../connections/game/GameSocket";

const domNode = document.getElementById('homepage-root');
if (domNode) {
  const root = createRoot(domNode);
  root.render(
    <React.StrictMode>
        <WebSocketProvider url={getWsUrl(GAME_WS_URL_SUFFIX)}>
            <HomePageBody />
        </WebSocketProvider>
    </React.StrictMode>
  );
}