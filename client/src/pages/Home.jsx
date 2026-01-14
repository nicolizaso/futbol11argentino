import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Home() {
  const { currentUser } = useAuth();

  const games = [
    { id: 1, title: 'Jugadores en Común', img: 'img/logos juegos/IMG-Juego1.jpg', link: '/game1' },
    { id: 2, title: 'Juego 2', img: 'img/logos juegos/IMG-Juego2.jpg', link: '/game2' },
    { id: 3, title: '11 Argentino', img: 'img/logos juegos/IMG-Juego3.jpg', link: '/game3' },
    { id: 4, title: 'Juego 4', img: 'img/logos juegos/IMG-Juego4.jpg', link: '/game4' },
    { id: 5, title: 'Juego 5', img: 'img/logos juegos/IMG-Juego5.jpg', link: '/game5' },
    { id: 6, title: 'Juego 6', img: 'img/logos juegos/IMG-Juego6.jpg', link: '/game6' },
    { id: 7, title: 'Juego 7', img: 'img/logos juegos/IMG-Juego7.jpg', link: '/game7' },
    { id: 8, title: 'Juego 8', img: 'img/logos juegos/IMG-Juego8.jpg', link: '/game8' },
  ];

  return (
    <div className="min-h-screen bg-navy text-white pb-20">
      <header className="flex justify-between items-center px-6 py-4 bg-navy sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl text-gold">Fútbol 11 Argentino</h1>
        <Link
          to={currentUser ? "/profile" : "/login"}
          className="text-sm underline font-sans"
        >
          {currentUser ? "Mi Perfil" : "Iniciá Sesión"}
        </Link>
      </header>

      <main className="p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate rounded-lg overflow-hidden shadow-lg flex flex-col"
            >
              <img src={game.img} alt={game.title} className="w-full h-32 object-cover" />
              <div className="p-3 flex flex-col flex-grow justify-between">
                <h2 className="text-lg mb-2 leading-tight">{game.title}</h2>
                <Link
                  to={game.link}
                  className="bg-gold text-white text-center py-2 rounded font-bold hover:bg-yellow-600 transition-colors"
                >
                  Jugar
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
