import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter font-body>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
