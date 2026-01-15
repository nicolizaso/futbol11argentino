import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WIPScreen({ onAccessGranted }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_SITE_PASSWORD) {
        onAccessGranted();
    } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0d1b2a] z-50 flex flex-col items-center justify-center p-4">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center max-w-md w-full"
        >
             {/* Logo Container */}
             <motion.div
                animate={{
                    boxShadow: ["0 0 0 0 rgba(255, 255, 255, 0.7)", "0 0 0 20px rgba(255, 255, 255, 0)"],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                }}
                className="bg-white rounded-full p-1.5 w-40 h-40 flex items-center justify-center shadow-2xl relative mb-8"
             >
                <div className="w-full h-full rounded-full border-4 border-[#0d1b2a] flex items-center justify-center p-4">
                     <img
                         src="/logo.png"
                         alt="Logo"
                         className="w-full h-full object-contain"
                     />
                </div>
             </motion.div>

             <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-heading font-extrabold text-white mb-2 text-center tracking-tight"
             >
                Próximamente
             </motion.h1>

             <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-[#74acdf] mb-8 text-center font-sans text-lg"
             >
                Estamos ultimando detalles para el lanzamiento.
             </motion.p>

             <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onSubmit={handleSubmit}
                className="w-full relative"
             >
                <input
                    type="password"
                    placeholder="Contraseña de acceso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1b263b] text-white rounded-lg border border-[#74acdf]/30 focus:outline-none focus:border-[#74acdf] transition-colors placeholder-gray-500 text-center font-sans"
                />
                <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     type="submit"
                     className="mt-4 w-full bg-[#74acdf] text-[#0d1b2a] font-bold py-3 rounded-lg hover:bg-[#74acdf]/90 transition-colors font-sans"
                >
                    Ingresar
                </motion.button>
             </motion.form>

             <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 mt-3 text-sm font-semibold font-sans"
                    >
                        Contraseña incorrecta
                    </motion.p>
                )}
             </AnimatePresence>
        </motion.div>
    </div>
  );
}
