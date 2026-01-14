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
    <div className="min-h-screen bg-navy text-white flex flex-col font-sans selection:bg-lightblue selection:text-navy">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-navy/50 to-navy z-0 pointer-events-none" />

             {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-lightblue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-gold text-sm font-semibold tracking-wider mb-6">
                        LA PLATAFORMA DEPORTIVA DEFINITIVA
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-white font-display">
                        Demostrá cuánto sabés <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lightblue to-white">
                            de Fútbol
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
                        Desafía tus conocimientos con nuestros minijuegos interactivos.
                        Completá desafíos, subí de nivel y competí con amigos.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/game1"
                            className="w-full sm:w-auto px-8 py-4 bg-lightblue text-navy font-bold rounded-xl shadow-lg shadow-lightblue/20 hover:bg-white hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Trophy className="w-5 h-5" />
                            Jugar Último Lanzamiento
                        </Link>
                         <Link
                            to="/profile"
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            Ver Mi Progreso
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Games Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold font-display">
                    Nuestros <span className="text-gold">Juegos</span>
                </h2>
                <span className="text-sm text-gray-400">
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
    </div>
  );
}
