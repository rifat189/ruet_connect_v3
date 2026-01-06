
import React, { useEffect, useState, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Network from './pages/Network';
import Jobs from './pages/Jobs';
import Notices from './pages/Notices';
import Groups from './pages/Groups';
import GroupView from './pages/GroupView';
import Events from './pages/Events';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import Mentorship from './pages/Mentorship';
import { db } from './db';
import { User } from './types';
import { SocketProvider } from './context/SocketContext';
import ChatWidget from './components/ChatWidget';

// --- Scroll Restoration Utility ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Auth Context & Provider ---
interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- Route Guards ---
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth?mode=login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'Admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const authUser = await db.getCurrentUser();
    setCurrentUser(authUser);
    setLoading(false);
  };

  useEffect(() => {
    db.init();
    fetchUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await db.login(email, pass);
    if (data && data.user) {
      setCurrentUser(data.user);
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id'>) => {
    const data = await db.register(userData);
    if (data && data.user) {
      setCurrentUser(data.user);
    }
  };

  const logout = () => {
    db.logout();
    setCurrentUser(null);
  };

  const refreshUser = async () => {
    const authUser = await db.getCurrentUser();
    setCurrentUser(authUser);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user: currentUser, login, register, logout, refreshUser }}>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={currentUser ? <Navigate to="/feed" replace /> : <Home />} />
              <Route
                path="/auth"
                element={currentUser ? <Navigate to="/" replace /> : <Auth />}
              />
              <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
              <Route path="/network" element={<RequireAuth><Network /></RequireAuth>} />
              <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
              <Route path="/jobs" element={<RequireAuth><Jobs /></RequireAuth>} />
              <Route path="/notices" element={<RequireAuth><Notices /></RequireAuth>} />
              <Route path="/groups" element={<RequireAuth><Groups /></RequireAuth>} />
              <Route path="/groups/:id" element={<RequireAuth><GroupView /></RequireAuth>} />
              <Route path="/events" element={<RequireAuth><Events /></RequireAuth>} />
              <Route path="/mentorship" element={<RequireAuth><Mentorship /></RequireAuth>} />
              <Route path="/profile/:id" element={<RequireAuth><Profile /></RequireAuth>} />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
