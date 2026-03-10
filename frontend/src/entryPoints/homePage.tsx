import { createRoot } from 'react-dom/client';
import React from 'react';

import HomePageBody from '../homePage/HomePageBody';

const domNode = document.getElementById('homepage-root');
if (domNode) {
  const root = createRoot(domNode);
  root.render(
    <React.StrictMode>
        <HomePageBody />
    </React.StrictMode>
  );
}