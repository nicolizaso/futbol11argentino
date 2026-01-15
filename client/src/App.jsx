import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';

import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Game1 from './pages/Game1';
import Game2 from './pages/Game2';
import Game3 from './pages/Game3';
import Game4 from './pages/Game4';
import Admin from './pages/Admin';

const AnimatedRoutes = () => {
    const location = useLocation();
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route path="/game1" element={<Game1 />} />
                <Route path="/game2" element={<Game2 />} />
                <Route path="/game3" element={<Game3 />} />
                <Route path="/game4" element={<Game4 />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
