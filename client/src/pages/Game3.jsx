import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import shieldsData from '../data/shields.json';
import playersData from '../data/players.json';
import { Check, Search, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Constants & Helper Maps ---

// Specific Spanish Position Codes
// PO: Portero, DFD: Defensa Derecho, DFC: Defensa Central, DFI: Defensa Izquierdo
// MCD: Medio Centro Defensivo, MC: Medio Centro, MCO: Medio Centro Ofensivo, MD: Medio Derecho, MI: Medio Izquierdo
// DC: Delantero Centro, EI: Extremo Izquierdo, ED: Extremo Derecho

const FALLBACK_FORMATION = {
  name: "4-3-3 Ofensivo",
  layout: [
    { id: 1, role: 'PO', top: '88%', left: '50%' },
    { id: 2, role: 'DFI', top: '70%', left: '20%' },
    { id: 3, role: 'DFC', top: '70%', left: '40%' },
    { id: 4, role: 'DFC', top: '70%', left: '60%' },
    { id: 5, role: 'DFD', top: '70%', left: '80%' },
    { id: 6, role: 'MC', top: '45%', left: '30%' },
    { id: 7, role: 'MCD', top: '45%', left: '50%' },
    { id: 8, role: 'MC', top: '45%', left: '70%' },
    { id: 9, role: 'EI', top: '20%', left: '20%' },
    { id: 10, role: 'DC', top: '15%', left: '50%' },
    { id: 11, role: 'ED', top: '20%', left: '80%' }
  ]
};

// Map Input Strings to Possible Specific Codes
const POSITION_MAPPING = {
  // GK
  'Arquero': ['PO'], 'GK': ['PO'], 'PO': ['PO'],
  // DEF
  'Defensor': ['DFD', 'DFC', 'DFI'], 'DF': ['DFD', 'DFC', 'DFI'],
  'LB': ['DFI'], 'RB': ['DFD'], 'CB': ['DFC'], 'LWB': ['DFI'], 'RWB': ['DFD'],
  'DFD': ['DFD'], 'DFC': ['DFC'], 'DFI': ['DFI'],
  // MID
  'Mediocampista': ['MCD', 'MC', 'MCO', 'MD', 'MI'], 'MF': ['MCD', 'MC', 'MCO', 'MD', 'MI'],
  'CDM': ['MCD'], 'CM': ['MC'], 'CAM': ['MCO'], 'LM': ['MI'], 'RM': ['MD'],
  'MCD': ['MCD'], 'MC': ['MC'], 'MCO': ['MCO'], 'MD': ['MD'], 'MI': ['MI'],
  // FWD
  'Delantero': ['EI', 'ED', 'DC'], 'FW': ['EI', 'ED', 'DC'],
  'ST': ['DC'], 'CF': ['DC'], 'LW': ['EI'], 'RW': ['ED'],
  'DC': ['DC'], 'EI': ['EI'], 'ED': ['ED']
};

const getShieldUrl = (teamName) => `/img/escudos equipos/A/${teamName}.png`;

export default function Game3() {
  const { currentUser } = useAuth();

  // Game State
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [formation, setFormation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [gameState, setGameState] = useState('playing');

  // Input State
  const [inputVal, setInputVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Selector State (Smart Auto-Fill)
  const [positionSelector, setPositionSelector] = useState(null); // { player, options: [slotId, slotId] }

  // Refs
  const inputRef = useRef(null);

  // --- Initialization ---
  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    setLoading(true);
    setGameState('playing');
    setInputVal('');
    setFeedback(null);
    setPositionSelector(null);
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
                const randomForm = forms[Math.floor(Math.random() * forms.length)];
                if (randomForm.layout && randomForm.layout.length === 11) {
                    selectedFormation = randomForm;
                }
            }
        }
      } catch (e) {
        console.warn("Using fallback formation", e);
      }

      setFormation(selectedFormation);

      // Initialize Slots
      const initialSlots = selectedFormation.layout.map((pos, idx) => ({
        id: idx,
        role: pos.role || 'MC',
        style: { top: pos.top, left: pos.left },
        filled: false,
        player: null
      }));
      setSlots(initialSlots);

      // 2. Fetch Teams
      let teams = shieldsData;
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
    // Clear Selector state
    setPositionSelector(null);
    setInputVal('');

    const usedTeams = new Set(currentSlots.filter(s => s.filled && s.player).map(s => s.player.equipo));
    const available = teams.filter(t => !usedTeams.has(t));
    const pool = available.length > 0 ? available : teams;

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
    setPositionSelector(null);

    try {
      let playerData = null;
      try {
          if (db) {
            const q = query(collection(db, "jugadores"), where("nombre", "==", name));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) playerData = snapshot.docs[0].data();
          }
      } catch (e) {
          console.warn("Firestore query failed", e);
      }

      if (!playerData) {
        showFeedback('error', 'Jugador no encontrado.');
        setVerifying(false);
        return;
      }

      // Verify Team
      if (playerData.equipo !== activeTeam.name) {
        showFeedback('error', `Incorrecto. ${playerData.nombre} juega en ${playerData.equipo}`);
        if (navigator.vibrate) navigator.vibrate(200);
        setVerifying(false);
        return;
      }

      // Smart Matching
      const rawPos = playerData.posicion || playerData.position || 'MC';
      // Get array of possible specific codes
      const possibleCodes = POSITION_MAPPING[rawPos] || [rawPos]; // Fallback to raw if not in map

      // Find all empty slots that match ANY of these codes
      const matchingEmptySlots = slots.filter(s => !s.filled && possibleCodes.includes(s.role));

      if (matchingEmptySlots.length === 0) {
        showFeedback('error', `Sin posición disponible para ${rawPos} (${possibleCodes.join(', ')})`);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setVerifying(false);
        return;
      }

      if (matchingEmptySlots.length === 1) {
        // Single Match -> Auto-Fill
        finalizePlayerSelection(matchingEmptySlots[0].id, playerData);
      } else {
        // Multiple Matches -> Show Selector
        setPositionSelector({
            player: playerData,
            options: matchingEmptySlots.map(s => s.id)
        });
        setVerifying(false);
      }

    } catch (error) {
      console.error(error);
      showFeedback('error', 'Error verificando el jugador');
      setVerifying(false);
    }
  };

  const finalizePlayerSelection = (slotId, playerData) => {
     const newSlots = slots.map(s => {
        if (s.id === slotId) {
            return {
                ...s,
                filled: true,
                player: {
                    nombre: playerData.nombre,
                    equipo: playerData.equipo,
                    shieldUrl: getShieldUrl(playerData.equipo)
                }
            };
        }
        return s;
     });

     setSlots(newSlots);
     setPositionSelector(null);

     // Success Feedback
     showFeedback('success', `¡${playerData.nombre} asignado!`);

     // Check Win
     const filledCount = newSlots.filter(s => s.filled).length;
     if (filledCount === 11) {
        handleWin(newSlots); // pass updated slots
     } else {
        pickNextTeam(teamsList, newSlots);
     }

     setVerifying(false);
  };

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleWin = async (finalSlots) => {
    setGameState('won');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#74acdf', '#ffffff', '#0d1b2a']
    });

    if (currentUser) {
        try {
            const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
            const teamOf11 = finalSlots.map(s => ({
                position: s.role,
                player: s.player.nombre,
                team: s.player.equipo
            }));

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

  // --- Render ---

  return (
    <GameLayout title="11 Argentino">
      <div className="flex flex-col h-full max-w-lg mx-auto w-full relative">

        {/* Header Info */}
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

        {/* Pitch */}
        <div className="relative w-full aspect-[3/4] bg-[#0d1b2a] rounded-xl border-4 border-white/10 shadow-2xl overflow-hidden mb-6">
            {/* Markings */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] aspect-square rounded-full border-2 border-[#74acdf]"></div>
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#74acdf] -translate-y-1/2"></div>
                <div className="absolute top-0 left-[20%] right-[20%] h-[15%] border-2 border-t-0 border-[#74acdf]"></div>
                <div className="absolute bottom-0 left-[20%] right-[20%] h-[15%] border-2 border-b-0 border-[#74acdf]"></div>
                <div className="absolute top-0 left-[35%] right-[35%] h-[6%] border-2 border-t-0 border-[#74acdf]"></div>
                <div className="absolute bottom-0 left-[35%] right-[35%] h-[6%] border-2 border-b-0 border-[#74acdf]"></div>
            </div>

            {/* Players */}
            <div className="absolute inset-0 z-10">
                {slots.map((slot) => (
                    <motion.div
                        key={slot.id}
                        layoutId={`slot-${slot.id}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-[18%] max-w-[70px] aspect-square"
                        style={{ top: slot.style.top, left: slot.style.left }}
                    >
                        {slot.filled ? (
                            <motion.div
                                initial={{ scale: 0.5, y: -50, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-full h-full relative"
                            >
                                <div className="w-full h-full bg-white rounded-full border-2 border-primary shadow-lg flex flex-col items-center justify-center overflow-hidden relative">
                                    <img src={slot.player.shieldUrl} alt={slot.player.equipo} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                                    <div className="z-10 flex flex-col items-center justify-center w-full px-1">
                                        <span className="text-[10px] md:text-xs font-bold text-navy text-center leading-none line-clamp-2">{slot.player.nombre}</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-white">
                                    <Check size={10} />
                                </div>
                            </motion.div>
                        ) : (
                            <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
                                <span className="text-white/50 text-xs font-bold">{slot.role}</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Controls */}
        <AnimatePresence mode="wait">
        {gameState === 'playing' && activeTeam && (
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="bg-surface/90 backdrop-blur-md rounded-t-2xl p-4 border-t border-white/10 -mx-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] min-h-[160px]"
            >
                {/* Active Team */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white rounded-full p-1.5 shadow-md w-12 h-12 flex-shrink-0">
                        <img src={activeTeam.shieldUrl} alt={activeTeam.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-xs text-primary font-bold uppercase tracking-wider">Próximo Jugador de:</p>
                        <p className="text-lg text-white font-heading font-bold leading-none">{activeTeam.name}</p>
                    </div>
                </div>

                {/* Input OR Selector */}
                {positionSelector ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-2"
                    >
                        <p className="text-sm text-center text-white/80">Elige la posición para <span className="font-bold text-primary">{positionSelector.player.nombre}</span>:</p>
                        <div className="flex gap-2 justify-center flex-wrap">
                            {positionSelector.options.map(slotId => {
                                const slot = slots.find(s => s.id === slotId);
                                return (
                                    <motion.button
                                        key={slotId}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => finalizePlayerSelection(slotId, positionSelector.player)}
                                        className="bg-primary hover:bg-primary-dark text-navy font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
                                    >
                                        {slot.role}
                                    </motion.button>
                                );
                            })}
                        </div>
                         <button
                            onClick={() => {
                                setPositionSelector(null);
                                setInputVal('');
                            }}
                            className="text-xs text-gray-400 mt-2 hover:text-white underline text-center"
                        >
                            Cancelar / Elegir otro
                        </button>
                    </motion.div>
                ) : (
                    /* Normal Input */
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
                )}

                {/* Feedback */}
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

        {/* Win Actions */}
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
    </GameLayout>
  );
}
