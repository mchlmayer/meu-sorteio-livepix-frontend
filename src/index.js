import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Pode ser um arquivo vazio ou com estilos globais
import App from './App'; // Importa o seu componente principal App

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
