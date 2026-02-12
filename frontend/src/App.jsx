import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import CalendarPage from './pages/CalendarPage'
import RemindersPage from './pages/RemindersPage'
import ProfilePage from './pages/ProfilePage'

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-[3px] border-brand-300 border-t-transparent animate-spin" />
      </div>
    )
  }
  
  return currentUser ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-[3px] border-brand-300 border-t-transparent animate-spin" />
      </div>
    )
  }
  
  return currentUser ? <Navigate to="/" replace /> : children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <CalendarPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <PrivateRoute>
                <Layout>
                  <RemindersPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
