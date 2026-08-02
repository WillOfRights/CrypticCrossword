import { createRoot } from 'react-dom/client';
import * as React from 'react';

import HomePageBody from '../homePage/HomePageBody';
import {WebSocketProvider} from "../connections/webSocket/WebSocketProvider";
import {getWsUrl, PUZZLE_WS_URL_SUFFIX} from "../connections/webSocket/WebSocketUtils";

const domNode = document.getElementById('homepage-root');
if (domNode) {
  const root = createRoot(domNode);
  root.render(
    <React.StrictMode>
        <WebSocketProvider url={getWsUrl(PUZZLE_WS_URL_SUFFIX)}>
            <HomePageBody />
        </WebSocketProvider>
    </React.StrictMode>
  );
}