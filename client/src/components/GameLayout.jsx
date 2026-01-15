import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GameLayout({ title, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <header className="flex items-center px-4 py-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40 shadow-lg border-b border-white/5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="mr-4 p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-accent" />
        </motion.button>
        <h1 className="text-xl font-heading font-bold text-white flex-grow text-center pr-10">{title}</h1>
      </header>

      <main className="flex-grow p-4 container mx-auto max-w-lg w-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
