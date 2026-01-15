import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function GameCard({ game, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-xl border-2 border-primary bg-background-dark"
    >
      <Link to={game.link} className="block w-full h-full">
        {/* Background Image */}
        <img
            src={game.img}
            alt={game.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
            {/* Badges - Positioned top left */}
            <div className="absolute top-4 left-4 flex gap-2">
                {game.badges && game.badges.map((badge, i) => (
                    <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                        badge === 'Nuevo' ? 'bg-primary text-white' :
                        badge === 'Difícil' ? 'bg-red-500 text-white' :
                        'bg-white text-background-dark'
                    }`}>
                        {badge}
                    </span>
                ))}
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 font-heading">
                {game.title}
            </h3>

            <div className="flex items-center gap-2 text-primary opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-sm font-medium font-sans">Jugar Ahora</span>
                <Play className="w-4 h-4 fill-current" />
            </div>
        </div>
      </Link>
    </motion.div>
  );
}
