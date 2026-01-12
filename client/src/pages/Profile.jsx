import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-navy text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl text-gold mb-6">Mi Perfil</h1>

        <div className="bg-slate rounded-lg p-6 shadow-lg mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-2xl font-bold">
              {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentUser?.displayName}</h2>
              <p className="text-gray-400">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
