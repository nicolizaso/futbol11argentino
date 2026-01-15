import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GameLayout from '../components/GameLayout';
import LevelSelector from '../components/LevelSelector';
import { getDailyChallenge, getLevel, saveProgress, getCompletedLevels } from '../services/gameService';
import { motion, AnimatePresence } from 'framer-motion';

const TEAMS = [
  { id: 'River', name: 'River Plate' },
  { id: 'Boca', name: 'Boca Juniors' },
  { id: 'Independiente', name: 'Independiente' },
  { id: 'Racing', name: 'Racing Club' },
  { id: 'SanLorenzo', name: 'San Lorenzo' },
  { id: 'Huracan', name: 'Huracán' },
];

export default function Game1() {
  const { currentUser } = useAuth();
  const [mode, setMode] = useState(null); // 'daily' or 'levels'
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'won'
  const [gameData, setGameData] = useState(null);
  const [foundPlayers, setFoundPlayers] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedLevels, setCompletedLevels] = useState({});
  const [currentLevelInfo, setCurrentLevelInfo] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadCompletedLevels();
    }
  }, [currentUser]);

  const loadCompletedLevels = async () => {
    if (!currentUser) return;
    const completed = await getCompletedLevels(currentUser.displayName || currentUser.email.split('@')[0]);
    setCompletedLevels(completed);
  };

  const startDailyChallenge = async () => {
    setLoading(true);
    try {
      const data = await getDailyChallenge('juego1');
      if (data) {
        setGameData({
          ...data,
          target: data.cantidad || data.jugadores.length
        });
        setMode('daily');
        setGameState('playing');
        setFoundPlayers([]);
        setMessage('');
      } else {
        setMessage('No hay desafío diario disponible hoy.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error al cargar el desafío.');
    } finally {
      setLoading(false);
    }
  };

  const startLevel = async (teamId, level, teamName) => {
    setLoading(true);
    try {
      const data = await getLevel('juego1', teamId, level);
      if (data) {
        setGameData({
          ...data,
          target: data.cantidad || data.jugadores.length
        });
        setCurrentLevelInfo({ teamId, level, teamName });
        setMode('levels');
        setGameState('playing');
        setFoundPlayers([]);
        setMessage('');
      } else {
        alert('Nivel no encontrado');
      }
    } catch (error) {
      console.error(error);
      alert('Error al cargar el nivel');
    } finally {
      setLoading(false);
    }
  };

  const handleInputSubmit = async () => {
    if (!inputVal.trim()) return;
    const player = inputVal.trim();

    const isValid = gameData.jugadores.some(p => p.toLowerCase() === player.toLowerCase());
    const isFound = foundPlayers.some(p => p.toLowerCase() === player.toLowerCase());

    if (!isValid) {
      setMessage('El jugador no jugó en ambos clubes (o revisá la ortografía).');
      return;
    }

    if (isFound) {
      setMessage('Ya nombraste a ese jugador.');
      return;
    }

    const correctCasing = gameData.jugadores.find(p => p.toLowerCase() === player.toLowerCase());
    const newFound = [...foundPlayers, correctCasing];
    setFoundPlayers(newFound);
    setInputVal('');
    setMessage('');

    if (newFound.length >= gameData.target) {
      setGameState('won');
      if (currentUser) {
        const username = currentUser.displayName || currentUser.email.split('@')[0];
        if (mode === 'daily') {
          await saveProgress(username, 'juego1', 'daily', null, {
            fecha: new Date().toISOString().slice(0, 10),
            jugadores: newFound
          });
        } else {
          await saveProgress(username, 'juego1', 'levels', `${currentLevelInfo.teamId}_Nivel${currentLevelInfo.level}`, {
            equipo: currentLevelInfo.teamId,
            nivel: currentLevelInfo.level,
            fecha: new Date().toISOString(),
            jugadores: newFound
          });
          loadCompletedLevels();
        }
      }
    }
  };

  return (
    <GameLayout title="Jugadores en Común">
      {gameState === 'menu' && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
          <div className="bg-surface/50 backdrop-blur-md p-6 rounded-xl shadow-lg text-center border border-white/10">
            <h2 className="text-xl text-primary font-bold mb-2 font-heading">¿Cómo se juega?</h2>
            <p className="text-gray-300 mb-6 font-sans">
              Tu misión es encontrar jugadores que hayan jugado en los dos equipos presentados.
            </p>

            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startDailyChallenge}
                disabled={loading}
                className="py-3 bg-primary text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                {loading ? 'Cargando...' : 'Desafío Diario'}
              </motion.button>
            </div>
          </div>

          <LevelSelector
            teams={TEAMS}
            completedLevels={completedLevels}
            onSelectLevel={startLevel}
          />

          {message && <p className="text-center text-red-400">{message}</p>}
        </motion.div>
      )}

      {gameState === 'playing' && gameData && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto"
        >
           <div className="flex items-center justify-center gap-8 mb-8">
             <div className="text-center">
               <div className="w-20 h-20 bg-white/5 rounded-full p-4 mb-2 mx-auto border border-white/10 shadow-lg">
                 <img
                   src={`/img/escudos equipos/A/${gameData.equipo1}.png`}
                   alt={gameData.equipo1}
                   className="w-full h-full object-contain"
                 />
               </div>
               <span className="font-bold text-sm text-gray-200">{gameData.equipo1}</span>
             </div>

             <div className="text-3xl font-heading text-primary font-black">VS</div>

             <div className="text-center">
               <div className="w-20 h-20 bg-white/5 rounded-full p-4 mb-2 mx-auto border border-white/10 shadow-lg">
                 <img
                   src={`/img/escudos equipos/A/${gameData.equipo2}.png`}
                   alt={gameData.equipo2}
                   className="w-full h-full object-contain"
                 />
               </div>
               <span className="font-bold text-sm text-gray-200">{gameData.equipo2}</span>
             </div>
           </div>

           <div className="mb-6 relative">
             <div className="flex gap-2">
               <input
                 type="text"
                 value={inputVal}
                 onChange={(e) => setInputVal(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                 placeholder="Nombre del jugador..."
                 className={`flex-grow p-4 rounded-lg bg-surface/50 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 font-sans ${
                     message.includes('jugador no jugó') ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:ring-primary'
                 }`}
               />
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={handleInputSubmit}
                 className="px-6 bg-primary rounded-lg font-bold text-white shadow-lg hover:shadow-primary/20"
               >
                 →
               </motion.button>
             </div>
             {message && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 text-sm text-center p-2 rounded ${
                        message.includes('jugador no jugó') || message.includes('Ya nombraste')
                        ? 'text-white bg-red-500/80 border border-red-500'
                        : 'text-white bg-primary/20 border border-primary'
                    }`}
                >
                    {message}
                </motion.p>
             )}
           </div>

           <div className="text-center mb-4">
             <p className="text-primary font-heading text-2xl font-bold">
               {foundPlayers.length} / {gameData.target}
             </p>
             <p className="text-xs text-gray-400 tracking-wider">JUGADORES ENCONTRADOS</p>
           </div>

           <div className="space-y-2">
             <AnimatePresence>
               {foundPlayers.map((player) => (
                 <motion.div
                   key={player}
                   initial={{ opacity: 0, x: -20, scale: 0.9 }}
                   animate={{ opacity: 1, x: 0, scale: 1 }}
                   className="p-3 bg-surface/50 backdrop-blur-sm rounded-lg text-center border border-primary shadow-[0_0_15px_rgba(116,172,223,0.3)] text-white font-medium"
                 >
                   {player}
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>
        </motion.div>
      )}

      {gameState === 'won' && (
        <div className="text-center pt-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-8"
          >
            <h2 className="text-4xl text-primary font-heading font-black mb-4 drop-shadow-lg">¡Felicitaciones!</h2>
            <p className="text-xl text-gray-200">Completaste el {mode === 'daily' ? 'desafío diario' : 'nivel'}.</p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGameState('menu')}
            className="px-8 py-3 bg-white text-background font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
          >
            Volver al Menú
          </motion.button>
        </div>
      )}
    </GameLayout>
  );
}
