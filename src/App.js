import React from 'react';
import SorteioPage from './SorteioPage';
import AdminPage from './AdminPage';

function App() {
  const isAdmin = window.location.pathname === '/admin-sorteio-x7k2';
  return isAdmin ? <AdminPage /> : <SorteioPage />;
}

export default App;
