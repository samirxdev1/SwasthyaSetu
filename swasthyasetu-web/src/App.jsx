import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';



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
