import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './context/store.ts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { keycloakEnv } from './utils/config.ts';

document.title = keycloakEnv.realm === 'adex' ? 'ADeX canvas' : 'GDI canvas';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <ToastContainer />
    </Provider>
  </React.StrictMode>
);
