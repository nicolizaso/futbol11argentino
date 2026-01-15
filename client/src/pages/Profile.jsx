import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow p-6 container mx-auto max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
            >
                <h1 className="text-3xl font-heading text-primary mb-6 font-bold">Mi Perfil</h1>

                <div className="bg-white rounded-xl p-6 shadow-lg mb-6 border border-white/10 text-navy">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg text-white">
                    {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                    <h2 className="text-xl font-bold text-navy">{currentUser?.displayName}</h2>
                    <p className="text-gray-500 text-sm">{currentUser?.email}</p>
                    </div>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-4">
                     <p className="text-primary hover:underline cursor-pointer transition-colors text-sm">
                        Editar Información
                     </p>
                </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg transition-all shadow-lg"
                >
                Cerrar Sesión
                </motion.button>
            </motion.div>
        </main>
        <Footer />
    </div>
  );
}
