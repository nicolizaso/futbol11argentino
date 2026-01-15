import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { saveProgress } from '../services/gameService';
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import shieldsData from '../data/shields.json';
import playersData from '../data/players.json';
import { Check, X, Search, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Constants & Fallbacks ---

// Fallback formation if DB fetch fails
const FALLBACK_FORMATION = {
  name: "4-3-3 Ofensivo",
  layout: [
    { id: 1, role: 'GK', top: '88%', left: '50%' },
    { id: 2, role: 'DF', top: '70%', left: '20%' }, // LB
    { id: 3, role: 'DF', top: '70%', left: '40%' }, // CB
    { id: 4, role: 'DF', top: '70%', left: '60%' }, // CB
    { id: 5, role: 'DF', top: '70%', left: '80%' }, // RB
    { id: 6, role: 'MF', top: '45%', left: '30%' }, // CM
    { id: 7, role: 'MF', top: '45%', left: '50%' }, // CDM
    { id: 8, role: 'MF', top: '45%', left: '70%' }, // CM
    { id: 9, role: 'FW', top: '20%', left: '20%' }, // LW
    { id: 10, role: 'FW', top: '15%', left: '50%' }, // ST
    { id: 11, role: 'FW', top: '20%', left: '80%' }  // RW
  ],
  counts: { GK: 1, DF: 4, MF: 3, FW: 3 }
};

// Position Mapping
const ROLE_MAP = {
  'Arquero': 'GK', 'GK': 'GK',
  'Defensor': 'DF', 'DF': 'DF', 'LB': 'DF', 'RB': 'DF', 'CB': 'DF', 'LWB': 'DF', 'RWB': 'DF',
  'Mediocampista': 'MF', 'MF': 'MF', 'CDM': 'MF', 'CM': 'MF', 'CAM': 'MF', 'LM': 'MF', 'RM': 'MF',
  'Delantero': 'FW', 'FW': 'FW', 'ST': 'FW', 'CF': 'FW', 'LW': 'FW', 'RW': 'FW'
};

const getShieldUrl = (teamName) => `/img/escudos equipos/A/${teamName}.png`;

export default function Game3() {
  const { currentUser } = useAuth();
  // Game State
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [formation, setFormation] = useState(null); // { layout: [], counts: {} }
  const [slots, setSlots] = useState([]); // Array of 11 slot objects
  const [teamsList, setTeamsList] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null); // { name, shieldUrl }
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won'

  // Input State
  const [inputVal, setInputVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg: '' }

  // Refs
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);

  // --- Initialization ---
  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    setLoading(true);
    setGameState('playing');
    setInputVal('');
    setFeedback(null);
    setStartTime(Date.now());

    try {
      // 1. Fetch Formation
      let selectedFormation = FALLBACK_FORMATION;
      try {
        if (db) {
            const formSnapshot = await getDocs(query(collection(db, "formaciones")));
            if (!formSnapshot.empty) {
            const forms = formSnapshot.docs.map(d => d.data());
            // Pick random
            selectedFormation = forms[Math.floor(Math.random() * forms.length)];
            // Ensure it has layout
            if (!selectedFormation.layout) selectedFormation = FALLBACK_FORMATION;
            }
        }
      } catch (e) {
        console.warn("Using fallback formation", e);
      }

      setFormation(selectedFormation);

      // Initialize Slots
      // layout is expected to be array of objects with { role, top, left }
      const initialSlots = selectedFormation.layout.map((pos, idx) => ({
        id: idx,
        role: pos.role || 'MF', // default
        style: { top: pos.top, left: pos.left },
        filled: false,
        player: null
      }));
      setSlots(initialSlots);

      // 2. Fetch Teams
      let teams = shieldsData; // Start with fallback
      try {
        if (db) {
            const teamsSnapshot = await getDocs(collection(db, "equipos"));
            if (!teamsSnapshot.empty) {
                teams = teamsSnapshot.docs.map(d => d.data().nombre);
            }
        }
      } catch (e) {
        console.warn("Using fallback teams list", e);
      }
      setTeamsList(teams);

      // 3. Pick Initial Team
      pickNextTeam(teams, initialSlots);

    } catch (error) {
      console.error("Init Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickNextTeam = (teams, currentSlots) => {
    // Pick a random team
    // Optional: Could exclude teams already on the pitch if we want '11 clubs distinct' rule
    // The prompt says "Generate a new random team".
    // I will try to avoid duplicates if possible, but randomness is key.

    // Get used teams
    const usedTeams = new Set(currentSlots.filter(s => s.filled && s.player).map(s => s.player.equipo));

    // Filter available teams
    const available = teams.filter(t => !usedTeams.has(t));
    const pool = available.length > 0 ? available : teams; // Fallback to all if exhausted

    const randomTeam = pool[Math.floor(Math.random() * pool.length)];
    setActiveTeam({
      name: randomTeam,
      shieldUrl: getShieldUrl(randomTeam)
    });
  };

  // --- Input Handling ---

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    if (val.length > 2) {
      const filtered = playersData
        .filter(p => p.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name) => {
    setInputVal(name);
    setShowSuggestions(false);
    submitPlayer(name);
  };

  const submitPlayer = async (name) => {
    setVerifying(true);
    setFeedback(null);

    try {
      // 1. Verify Player in DB (get Team & Position)
      let playerData = null;

      try {
          if (db) {
            const q = query(collection(db, "jugadores"), where("nombre", "==", name));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                playerData = snapshot.docs[0].data();
            }
          }
      } catch (e) {
          console.warn("Firestore query failed, using mock data if possible or fail", e);
      }

      if (!playerData) {
        // Fallback or Error
        // If DB is down, we can't verify unless we have local player db.
        // The instructions imply DB connection.
        // I'll show error.
        showFeedback('error', 'No se pudo verificar el jugador (Error de conexión o no encontrado).');
        setVerifying(false);
        return;
      }

      // 2. Verify Team
      if (playerData.equipo !== activeTeam.name) {
        showFeedback('error', `Incorrecto. ${playerData.nombre} juega en ${playerData.equipo}`);
        setVerifying(false);
        return;
      }

      // 3. Verify Position & Find Slot
      const rawPos = playerData.posicion || playerData.position || 'MF'; // fallback
      const role = ROLE_MAP[rawPos] || 'MF';

      // Find first empty slot matching role
      const slotIndex = slots.findIndex(s => s.role === role && !s.filled);

      if (slotIndex === -1) {
        showFeedback('error', `La posición ${role} (${rawPos}) ya está completa`);
        setVerifying(false);
        return;
      }

      // 4. Fill Slot
      const newSlots = [...slots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        filled: true,
        player: {
          nombre: playerData.nombre,
          equipo: playerData.equipo,
          shieldUrl: getShieldUrl(playerData.equipo)
        }
      };
      setSlots(newSlots);

      showFeedback('success', `¡Correcto! ${playerData.nombre} agregado.`);
      setInputVal('');

      // 5. Check Win or Next
      const filledCount = newSlots.filter(s => s.filled).length;
      if (filledCount === 11) {
        handleWin();
      } else {
        pickNextTeam(teamsList, newSlots);
      }

    } catch (error) {
      console.error(error);
      showFeedback('error', 'Error verificando el jugador');
    } finally {
      setVerifying(false);
    }
  };

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleWin = async () => {
    setGameState('won');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#74acdf', '#ffffff', '#0d1b2a'] // Arg colors
    });

    // Save Result
    if (currentUser) {
        try {
            const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
            const teamOf11 = slots.map(s => ({
                position: s.role,
                player: s.player.nombre,
                team: s.player.equipo
            }));

            // Using direct save to a generic collection as gameService.saveProgress is specific to 'daily' or 'levels'
            // But we can adapt saveProgress if we define a type.
            // For now, let's write to a dedicated collection for Game 3 history.

            await setDoc(doc(collection(db, `usuarios/${currentUser.uid}/partidasJuego3`)), {
                fecha: new Date().toISOString(),
                tiempo: timeElapsed,
                equipo: teamOf11,
                timestamp: serverTimestamp()
            });

        } catch (error) {
            console.error("Error saving game:", error);
        }
    }
  };

  // --- Render Helpers ---

  return (
    <GameLayout title="11 Argentino">
      <div className="flex flex-col h-full max-w-lg mx-auto w-full relative">

        {/* Game Area */}
        <div className="flex-grow flex flex-col relative">

            {/* Header / Info */}
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="text-sm text-gray-400">
                    <span className="text-primary font-bold">{slots.filter(s=>s.filled).length}</span>/11 Jugadores
                </div>
                {gameState === 'won' && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-2"
                    >
                        <Trophy size={14} /> COMPLETADO
                    </motion.div>
                )}
            </div>

            {/* Pitch Container */}
            <div className="relative w-full aspect-[3/4] bg-[#0d1b2a] rounded-xl border-4 border-white/10 shadow-2xl overflow-hidden mb-6">

                {/* Pitch Markings (Sky Blue Lines) */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                    {/* Center Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] aspect-square rounded-full border-2 border-[#74acdf]"></div>
                    {/* Halfway Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#74acdf] -translate-y-1/2"></div>
                    {/* Penalty Areas */}
                    <div className="absolute top-0 left-[20%] right-[20%] h-[15%] border-2 border-t-0 border-[#74acdf]"></div>
                    <div className="absolute bottom-0 left-[20%] right-[20%] h-[15%] border-2 border-b-0 border-[#74acdf]"></div>
                    {/* Goal Areas */}
                    <div className="absolute top-0 left-[35%] right-[35%] h-[6%] border-2 border-t-0 border-[#74acdf]"></div>
                    <div className="absolute bottom-0 left-[35%] right-[35%] h-[6%] border-2 border-b-0 border-[#74acdf]"></div>
                    {/* Corner Arcs */}
                    <div className="absolute top-0 left-0 w-[5%] aspect-square border-r-2 border-b-2 border-[#74acdf] rounded-br-full"></div>
                    <div className="absolute top-0 right-0 w-[5%] aspect-square border-l-2 border-b-2 border-[#74acdf] rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-[5%] aspect-square border-r-2 border-t-2 border-[#74acdf] rounded-tr-full"></div>
                    <div className="absolute bottom-0 right-0 w-[5%] aspect-square border-l-2 border-t-2 border-[#74acdf] rounded-tl-full"></div>
                </div>

                {/* Players */}
                <div className="absolute inset-0 z-10">
                    {slots.map((slot) => (
                        <motion.div
                            key={slot.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-[18%] max-w-[70px] aspect-square"
                            style={{ top: slot.style.top, left: slot.style.left }}
                        >
                            {slot.filled ? (
                                <motion.div
                                    initial={{ scale: 0.8, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="w-full h-full relative"
                                >
                                    {/* Filled Slot: Player Name + Shield */}
                                    <div className="w-full h-full bg-white rounded-full border-2 border-primary shadow-lg flex flex-col items-center justify-center overflow-hidden relative">
                                        <img src={slot.player.shieldUrl} alt={slot.player.equipo} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                                        <div className="z-10 flex flex-col items-center justify-center w-full px-1">
                                            <span className="text-[10px] md:text-xs font-bold text-navy text-center leading-none line-clamp-2">{slot.player.nombre}</span>
                                        </div>
                                    </div>
                                    {/* Small check badge */}
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-white">
                                        <Check size={10} />
                                    </div>
                                </motion.div>
                            ) : (
                                /* Empty Slot */
                                <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
                                    <span className="text-white/50 text-xs font-bold">{slot.role}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Controls Area */}
            <AnimatePresence>
            {gameState === 'playing' && activeTeam && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-surface/90 backdrop-blur-md rounded-t-2xl p-4 border-t border-white/10 -mx-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]"
                >
                    {/* Active Team Prompt */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white rounded-full p-1.5 shadow-md w-12 h-12 flex-shrink-0">
                            <img src={activeTeam.shieldUrl} alt={activeTeam.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow">
                            <p className="text-xs text-primary font-bold uppercase tracking-wider">Próximo Jugador de:</p>
                            <p className="text-lg text-white font-heading font-bold leading-none">{activeTeam.name}</p>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="relative z-50">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputVal}
                            onChange={handleInputChange}
                            placeholder="Nombre del jugador..."
                            disabled={verifying}
                            className="w-full bg-navy/50 border border-white/20 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-500"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                        {/* Suggestions Dropdown */}
                        {showSuggestions && (
                             <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-white/10 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(s)}
                                        className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-gray-200 border-b border-white/5 last:border-0"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Feedback Toast */}
                    <AnimatePresence>
                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-2 text-xs md:text-sm text-center py-2 px-3 rounded-lg font-medium ${
                                    feedback.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-green-500/20 text-green-200 border border-green-500/30'
                                }`}
                            >
                                {feedback.msg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            )}

            {/* Win State Actions */}
            {gameState === 'won' && (
                 <div className="flex justify-center p-4">
                    <button
                        onClick={initGame}
                        className="bg-primary hover:bg-primary-dark text-navy font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                    >
                        <RotateCcw size={20} /> Jugar de Nuevo
                    </button>
                 </div>
            )}
            </AnimatePresence>

        </div>
      </div>
    </GameLayout>
  );
}
