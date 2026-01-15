import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameLayout({ title, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans">
      <header className="flex items-center px-4 py-4 bg-background/80 backdrop-blur-md sticky top-0 z-40 shadow-lg border-b border-white/5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="mr-4 p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </motion.button>
        <h1 className="text-xl font-heading font-bold text-white flex-grow text-center pr-10 uppercase tracking-wide">{title}</h1>
      </header>

      <main className="flex-grow p-4 container mx-auto max-w-lg w-full flex flex-col">
        <AnimatePresence mode="wait">
            <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex-grow flex flex-col"
            >
                {children}
            </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
