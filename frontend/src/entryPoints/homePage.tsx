import { createRoot } from 'react-dom/client';
import * as React from 'react';

import HomePageBody from '../homePage/HomePageBody';
import {WebSocketProvider} from "../connections/webSocket/WebSocketProvider";
import InteractablePuzzle from "../components/interactablePuzzle/InteractablePuzzle";

const domNode = document.getElementById('homepage-root');
if (domNode) {
  const root = createRoot(domNode);
  root.render(
    <React.StrictMode>
        <WebSocketProvider url={"wss://localhost:8080/ws"}>
            <HomePageBody />
        </WebSocketProvider>;
    </React.StrictMode>
  );
}