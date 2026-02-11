import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Stores from './pages/Stores';
import Departments from './pages/Departments';
import Suppliers from './pages/Suppliers';
import Items from './pages/Items';
import GRNs from './pages/GRNs';
import Requests from './pages/Requests';
import Issues from './pages/Issues';
import Stock from './pages/Stock';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/stores" element={
            <ProtectedRoute>
              <Layout>
                <Stores />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/departments" element={
            <ProtectedRoute>
              <Layout>
                <Departments />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/suppliers" element={
            <ProtectedRoute>
              <Layout>
                <Suppliers />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/items" element={
            <ProtectedRoute>
              <Layout>
                <Items />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/grns" element={
            <ProtectedRoute>
              <Layout>
                <GRNs />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/requests" element={
            <ProtectedRoute>
              <Layout>
                <Requests />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/issues" element={
            <ProtectedRoute>
              <Layout>
                <Issues />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/stock" element={
            <ProtectedRoute>
              <Layout>
                <Stock />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-800 font-bold text-center py-20">
                  <h2 className="text-2xl mb-2">Reports Module</h2>
                  <p className="text-gray-500 font-normal">Coming Soon: Detailed system analytics and export tools.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
