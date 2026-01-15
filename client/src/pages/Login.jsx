import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { motion } from 'framer-motion';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(user, { displayName: formData.username });
        await setDoc(doc(db, "usuarios", formData.username), {
          nombre: formData.fullName,
          usuario: formData.username,
          email: formData.email,
        });
      }
      navigate('/');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface/50 backdrop-blur-md p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/10"
      >
        <div className="flex flex-col items-center mb-8">
            <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                src="/logo.png"
                alt="Logo"
                className="w-24 h-24 object-contain mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            />
            <h1 className="text-3xl text-white font-heading font-bold text-center">Fútbol 11 Argentino</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {!isLogin && (
            <>
              <input
                type="text"
                name="fullName"
                placeholder="Nombre Completo"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary border border-white/10"
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Nombre de Usuario"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary border border-white/10"
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary border border-white/10"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary border border-white/10"
            required
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 mt-6"
          >
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </motion.button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-sm text-gray-400 hover:text-primary transition-colors text-center"
        >
          {isLogin ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </motion.div>
    </div>
  );
}
