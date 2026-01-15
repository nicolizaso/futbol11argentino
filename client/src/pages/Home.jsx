import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GameCard from '../components/GameCard';
import { Trophy } from 'lucide-react';

export default function Home() {
  const games = [
    { id: 1, title: 'Jugadores en Común', img: 'img/logos juegos/IMG-Juego1.jpg', link: '/game1', badges: ['Nuevo'] },
    { id: 2, title: 'Juego 2', img: 'img/logos juegos/IMG-Juego2.jpg', link: '/game2', badges: ['Popular'] },
    { id: 3, title: '11 Argentino', img: 'img/logos juegos/IMG-Juego3.jpg', link: '/game3', badges: ['Difícil'] },
    { id: 4, title: 'Juego 4', img: 'img/logos juegos/IMG-Juego4.jpg', link: '/game4' },
    { id: 5, title: 'Juego 5', img: 'img/logos juegos/IMG-Juego5.jpg', link: '/game5' },
    { id: 6, title: 'Juego 6', img: 'img/logos juegos/IMG-Juego6.jpg', link: '/game6' },
    { id: 7, title: 'Juego 7', img: 'img/logos juegos/IMG-Juego7.jpg', link: '/game7' },
    { id: 8, title: 'Juego 8', img: 'img/logos juegos/IMG-Juego8.jpg', link: '/game8' },
  ];

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background text-white flex flex-col font-sans selection:bg-primary selection:text-white"
    >
      <Navbar />

      <main className="flex-grow">
        {/* Games Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold font-heading">
                    Nuestros <span className="text-primary">Juegos</span>
                </h2>
                <span className="text-sm text-gray-400 font-sans">
                    {games.length} Disponibles
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game, index) => (
                    <GameCard key={game.id} game={game} index={index} />
                ))}
            </div>
        </section>
      </main>

      <Footer />
    </motion.div>
  );
}
