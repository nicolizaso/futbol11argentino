import GameLayout from '../components/GameLayout';
import { motion } from 'framer-motion';

export default function Game2() {
  return (
    <GameLayout title="Juego 2">
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <h2 className="text-3xl text-accent font-heading font-bold mb-4">Próximamente</h2>
            <p className="text-gray-300 text-lg">Este juego está en desarrollo.</p>
        </motion.div>
      </div>
    </GameLayout>
  );
}
