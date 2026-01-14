import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const POSITIONS = ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'LM', 'RM', 'CAM', 'ST'];

export default function Game3() {
  const [team, setTeam] = useState(Array(11).fill(null));
  const [usedClubs, setUsedClubs] = useState(new Set());
  const [inputVal, setInputVal] = useState('');
  const [currentPosIndex, setCurrentPosIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlayerSubmit = async () => {
    if (!inputVal.trim()) return;
    setLoading(true);
    setMessage('');

    try {
      const q = query(collection(db, "jugadores"), where("nombre", "==", inputVal.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage('Jugador no encontrado en la base de datos.');
        setLoading(false);
        return;
      }

      const playerData = querySnapshot.docs[0].data();
      const club = playerData.equipo;

      if (usedClubs.has(club)) {
        setMessage(`Ya usaste un jugador de ${club}.`);
        setLoading(false);
        return;
      }

      const newTeam = [...team];
      newTeam[currentPosIndex] = { ...playerData, position: POSITIONS[currentPosIndex] };
      setTeam(newTeam);

      const newUsedClubs = new Set(usedClubs);
      newUsedClubs.add(club);
      setUsedClubs(newUsedClubs);

      setInputVal('');
      if (currentPosIndex < 10) {
        setCurrentPosIndex(currentPosIndex + 1);
      } else {
        setMessage('¡Equipo completado!');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error al buscar jugador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameLayout title="11 Argentino">
      <div className="flex flex-col items-center">
        <div className="mb-6 text-center">
          <h2 className="text-xl text-gold mb-2">Armá tu 11 Ideal</h2>
          <p className="text-sm text-gray-400">11 jugadores de 11 clubes distintos.</p>
        </div>

        <div className="relative w-full max-w-md aspect-[2/3] bg-green-800 rounded-lg border-2 border-white/20 p-4 mb-6 shadow-inner"
             style={{ backgroundImage: 'linear-gradient(to bottom, #1a472a 0%, #2d5a3f 100%)' }}>

          {/* Field Lines */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 top-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full"></div>

          <div className="grid grid-cols-4 gap-2 h-full relative z-10">
             {/* GK */}
             <div className="col-start-2 col-span-2 flex justify-center items-end pb-4">
                <PlayerSlot player={team[0]} position="GK" active={currentPosIndex === 0} onClick={() => setCurrentPosIndex(0)} />
             </div>

             {/* DEF */}
             <div className="col-span-4 grid grid-cols-4 gap-1 items-end pb-4">
                <PlayerSlot player={team[1]} position="LB" active={currentPosIndex === 1} onClick={() => setCurrentPosIndex(1)} />
                <PlayerSlot player={team[2]} position="CB" active={currentPosIndex === 2} onClick={() => setCurrentPosIndex(2)} />
                <PlayerSlot player={team[3]} position="CB" active={currentPosIndex === 3} onClick={() => setCurrentPosIndex(3)} />
                <PlayerSlot player={team[4]} position="RB" active={currentPosIndex === 4} onClick={() => setCurrentPosIndex(4)} />
             </div>

             {/* MID */}
             <div className="col-span-4 grid grid-cols-4 gap-1 items-center">
                <PlayerSlot player={team[7]} position="LM" active={currentPosIndex === 7} onClick={() => setCurrentPosIndex(7)} />
                <PlayerSlot player={team[5]} position="CDM" active={currentPosIndex === 5} onClick={() => setCurrentPosIndex(5)} />
                <PlayerSlot player={team[6]} position="CM" active={currentPosIndex === 6} onClick={() => setCurrentPosIndex(6)} />
                <PlayerSlot player={team[8]} position="RM" active={currentPosIndex === 8} onClick={() => setCurrentPosIndex(8)} />
             </div>

             {/* FWD */}
             <div className="col-start-2 col-span-2 flex justify-center items-start pt-4 gap-2">
                <PlayerSlot player={team[9]} position="CAM" active={currentPosIndex === 9} onClick={() => setCurrentPosIndex(9)} />
                <PlayerSlot player={team[10]} position="ST" active={currentPosIndex === 10} onClick={() => setCurrentPosIndex(10)} />
             </div>
          </div>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Jugador para ${POSITIONS[currentPosIndex]}...`}
              className="flex-grow p-3 rounded bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button
              onClick={handlePlayerSubmit}
              disabled={loading}
              className="px-6 bg-gold rounded font-bold hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? '...' : '+'}
            </button>
          </div>
          {message && <p className="text-red-400 text-sm text-center">{message}</p>}
        </div>
      </div>
    </GameLayout>
  );
}

function PlayerSlot({ player, position, active, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        w-full aspect-square rounded-full flex flex-col items-center justify-center text-xs font-bold border-2
        ${active ? 'border-gold bg-gold/20' : 'border-white/20 bg-black/20'}
        ${player ? 'bg-navy border-navy' : ''}
        transition-colors
      `}
    >
      {player ? (
        <>
          <span className="text-[10px] leading-tight truncate w-full px-1">{player.nombre}</span>
          <span className="text-[8px] text-gray-400 truncate w-full px-1">{player.equipo}</span>
        </>
      ) : (
        <span className="opacity-50">{position}</span>
      )}
    </motion.button>
  );
}
