import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Relationships from './pages/Relationships';
import Negotiate from './pages/Negotiate';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/relationships" element={<Relationships />} />
        <Route path="/negotiate" element={<Negotiate />} />
      </Routes>
    </Router>
  );
}

export default App;
