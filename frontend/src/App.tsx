import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import Jobs from './pages/Jobs';
import Resources from './pages/Resources';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ResumeBuilder from './components/ResumeBuilder';
import BackendStatus from './components/common/BackendStatus';

function AppContent() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar className="fixed top-0 left-0 right-0 z-10" />}
      <div className="flex">
        {isAuthenticated && <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-10" />}
        <main className={`flex-1 ${isAuthenticated ? 'ml-64 pt-24 px-6 pb-6' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/resumes" element={
              <ProtectedRoute>
                <Resumes />
              </ProtectedRoute>
            } />
            <Route path="/resumes/new" element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
      <BackendStatus />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;