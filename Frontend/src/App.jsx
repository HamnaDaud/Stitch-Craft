import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';


// 1. Create a "Protected Route" component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If no token, kick them back to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Optional: Check if user is already logged in to redirect from login page
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* If logged in, go to Dashboard, else Login */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* This route is protected. Only accessible if logged in */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {/* Replace this <h1> with your actual Dashboard component later */}
                <h1 style={{color: 'black'}}>Welcome to StitchCraft Dashboard</h1> 
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;