import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import InputPage from './pages/InputPage';
import DownloadPage from './pages/DownloadPage';
import ReportHistoryPage from './pages/ReportHistoryPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/input" 
              element={
                <ProtectedRoute>
                  <InputPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/download" 
              element={
                <ProtectedRoute>
                  <DownloadPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <ReportHistoryPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;