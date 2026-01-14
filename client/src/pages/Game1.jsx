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
        <div className="space-y-8">
          <div className="bg-slate p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl text-gold mb-2">¿Cómo se juega?</h2>
            <p className="text-gray-300 mb-6">
              Tu misión es encontrar jugadores que hayan jugado en los dos equipos presentados.
            </p>

            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <button
                onClick={startDailyChallenge}
                disabled={loading}
                className="py-3 bg-gold text-white font-bold rounded hover:bg-yellow-600 transition-colors"
              >
                {loading ? 'Cargando...' : 'Desafío Diario'}
              </button>
            </div>
          </div>

          <LevelSelector
            teams={TEAMS}
            completedLevels={completedLevels}
            onSelectLevel={startLevel}
          />

          {message && <p className="text-center text-red-400">{message}</p>}
        </div>
      )}

      {gameState === 'playing' && gameData && (
        <div className="max-w-md mx-auto">
           <div className="flex items-center justify-center gap-8 mb-8">
             <div className="text-center">
               <div className="w-20 h-20 bg-white/5 rounded-full p-2 mb-2 mx-auto">
                 <img
                   src={`/img/escudos equipos/A/${gameData.equipo1}.png`}
                   alt={gameData.equipo1}
                   className="w-full h-full object-contain"
                 />
               </div>
               <span className="font-bold text-sm">{gameData.equipo1}</span>
             </div>

             <div className="text-2xl font-display text-gold">VS</div>

             <div className="text-center">
               <div className="w-20 h-20 bg-white/5 rounded-full p-2 mb-2 mx-auto">
                 <img
                   src={`/img/escudos equipos/A/${gameData.equipo2}.png`}
                   alt={gameData.equipo2}
                   className="w-full h-full object-contain"
                 />
               </div>
               <span className="font-bold text-sm">{gameData.equipo2}</span>
             </div>
           </div>

           <div className="mb-6">
             <div className="flex gap-2">
               <input
                 type="text"
                 value={inputVal}
                 onChange={(e) => setInputVal(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                 placeholder="Nombre del jugador..."
                 className="flex-grow p-3 rounded bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
               />
               <button
                 onClick={handleInputSubmit}
                 className="px-6 bg-gold rounded font-bold hover:bg-yellow-600"
               >
                 →
               </button>
             </div>
             {message && <p className="text-red-400 mt-2 text-sm text-center">{message}</p>}
           </div>

           <div className="text-center mb-4">
             <p className="text-gold font-display text-xl">
               {foundPlayers.length} / {gameData.target}
             </p>
             <p className="text-xs text-gray-400">JUGADORES ENCONTRADOS</p>
           </div>

           <div className="space-y-2">
             <AnimatePresence>
               {foundPlayers.map((player) => (
                 <motion.div
                   key={player}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="p-3 bg-slate rounded text-center border border-white/5"
                 >
                   {player}
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className="text-center pt-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-8"
          >
            <h2 className="text-4xl text-gold font-display mb-4">¡Felicitaciones!</h2>
            <p className="text-xl">Completaste el {mode === 'daily' ? 'desafío diario' : 'nivel'}.</p>
          </motion.div>

          <button
            onClick={() => setGameState('menu')}
            className="px-8 py-3 bg-white text-navy font-bold rounded hover:bg-gray-200 transition-colors"
          >
            Volver al Menú
          </button>
        </div>
      )}
    </GameLayout>
  );
}
