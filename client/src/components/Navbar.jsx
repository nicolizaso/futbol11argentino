import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            {/* Logo/Name */}
            <Link to="/" className="flex items-center space-x-2 group">
                <img src="/logo.png" alt="Futbol 11" className="max-h-10 w-auto object-contain" />
                <span className="text-xl md:text-2xl font-bold text-white tracking-tight font-heading group-hover:text-primary transition-colors hidden sm:block">
                    Fútbol <span className="text-primary group-hover:text-white transition-colors">11</span>
                </span>
            </Link>

            {/* User Actions */}
            <div className="flex items-center gap-4">
                 <Link
                    to={currentUser ? "/profile" : "/login"}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/50 hover:bg-surface border border-white/10 transition-all group"
                    >
                        <span className="text-sm font-medium text-gray-200 hidden sm:block font-sans">
                            {currentUser ? "Mi Perfil" : "Entrar"}
                        </span>
                        {currentUser ? (
                            <User className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                        ) : (
                            <LogIn className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
                        )}
                    </motion.div>
                </Link>
            </div>
        </div>
      </div>
    </nav>
  );
}
