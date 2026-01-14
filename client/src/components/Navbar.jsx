import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogIn } from 'lucide-react';

export default function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-navy/70 backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            {/* Logo/Name */}
            <Link to="/" className="flex items-center space-x-2 group">
                <span className="text-xl md:text-2xl font-bold text-white tracking-tight font-display group-hover:text-lightblue transition-colors">
                    Fútbol <span className="text-lightblue group-hover:text-white transition-colors">11</span>
                </span>
            </Link>

            {/* User Actions */}
            <div className="flex items-center gap-4">
                 <Link
                    to={currentUser ? "/profile" : "/login"}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                >
                    <span className="text-sm font-medium text-gray-200 hidden sm:block">
                        {currentUser ? "Mi Perfil" : "Entrar"}
                    </span>
                    {currentUser ? (
                        <User className="w-5 h-5 text-lightblue group-hover:text-white transition-colors" />
                    ) : (
                        <LogIn className="w-5 h-5 text-gold group-hover:text-white transition-colors" />
                    )}
                </Link>
            </div>
        </div>
      </div>
    </nav>
  );
}
