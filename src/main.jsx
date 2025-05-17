import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faBomb, faFlag, faRedo, faPlay, faClock, faTimes } from '@fortawesome/free-solid-svg-icons';

library.add(faBomb, faFlag, faRedo, faPlay, faClock, faTimes);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
