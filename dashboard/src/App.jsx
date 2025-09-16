// /dashboard/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SocialFeedPage from './pages/SocialFeedPage'; // <-- Import the new page
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Main Hazard Reports Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Social Media Feed Page */}
        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <SocialFeedPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;