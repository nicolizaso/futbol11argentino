import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import shields from '../data/shields.json'; // List of team names

export default function Admin() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'game2', 'players'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form States
  const [dailyForm, setDailyForm] = useState({
    game: 'juego1', date: '', team1: '', team2: '', players: '', count: 10
  });

  const [game2Form, setGame2Form] = useState({
      date: '',
      stages: Array(5).fill({ teamA: '', teamB: '', validPlayers: '' })
  });

  if (!currentUser) {
    return <div className="p-8 text-center text-white bg-background h-screen">Acceso denegado. <button onClick={() => navigate('/login')} className="underline text-primary">Iniciar Sesión</button></div>;
  }

  const handleDailySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [yyyy, mm, dd] = dailyForm.date.split('-');
      const docId = `Juego1-${dd}-${mm}-${yyyy}`;

      await setDoc(doc(db, `juegos/${dailyForm.game}/desafios-diarios/${docId}`), {
        ...dailyForm,
        jugadores: dailyForm.players.split(',').map(p => p.trim()),
        cantidad: parseInt(dailyForm.count)
      });
      setMessage('Desafío Game 1 guardado correctamente.');
    } catch (error) {
      console.error(error);
      setMessage('Error al guardar desafío.');
    } finally {
      setLoading(false);
    }
  };

  const handleGame2Submit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const { date, stages } = game2Form;
          // Validate
          if (!date || stages.some(s => !s.teamA || !s.teamB || !s.validPlayers)) {
              setMessage('Por favor completa todos los campos.');
              setLoading(false);
              return;
          }

          const formattedStages = stages.map(stage => ({
              teamA_id: stage.teamA,
              teamB_id: stage.teamB,
              validPlayers: stage.validPlayers.split(',').map(p => p.trim()).filter(p => p)
          }));

          // Doc ID as Date (YYYY-MM-DD)
          await setDoc(doc(db, `juegos/juego2/dailyChallenges/${date}`), {
              date,
              stages: formattedStages
          });

          setMessage('Desafío Game 2 guardado correctamente.');
      } catch (error) {
          console.error(error);
          setMessage('Error al guardar desafío Game 2.');
      } finally {
          setLoading(false);
      }
  };

  const updateStage = (index, field, value) => {
      const newStages = [...game2Form.stages];
      newStages[index] = { ...newStages[index], [field]: value };
      setGame2Form({ ...game2Form, stages: newStages });
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow p-6 container mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-3xl font-heading text-primary mb-6 font-bold">Panel de Administración</h1>

        <div className="flex space-x-4 mb-6 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-2 px-4 transition-colors whitespace-nowrap ${activeTab === 'daily' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            Game 1 (Diario)
          </button>
          <button
            onClick={() => setActiveTab('game2')}
            className={`pb-2 px-4 transition-colors whitespace-nowrap ${activeTab === 'game2' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            Game 2 (En 3, 2, 1...)
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`pb-2 px-4 transition-colors whitespace-nowrap ${activeTab === 'players' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            Jugadores (Game 3)
          </button>
        </div>

        {message && <div className={`p-4 rounded-lg border mb-6 ${message.includes('Error') ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>{message}</div>}

        {/* Game 1 Form */}
        {activeTab === 'daily' && (
          <form onSubmit={handleDailySubmit} className="space-y-4 bg-white p-6 rounded-xl border border-white/10 shadow-lg text-navy">
            <h2 className="text-xl mb-4 font-bold text-navy">Configurar Desafío Diario (Game 1)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fecha</label>
                <input
                  type="date"
                  value={dailyForm.date}
                  onChange={e => setDailyForm({...dailyForm, date: e.target.value})}
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cantidad de Jugadores</label>
                <input
                  type="number"
                  value={dailyForm.count}
                  onChange={e => setDailyForm({...dailyForm, count: e.target.value})}
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Equipo 1</label>
                <input
                  type="text"
                  value={dailyForm.team1}
                  onChange={e => setDailyForm({...dailyForm, team1: e.target.value})}
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="Ej: River Plate"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Equipo 2</label>
                <input
                  type="text"
                  value={dailyForm.team2}
                  onChange={e => setDailyForm({...dailyForm, team2: e.target.value})}
                  className="w-full p-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="Ej: Boca Juniors"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Jugadores Válidos (separados por coma)</label>
              <textarea
                value={dailyForm.players}
                onChange={e => setDailyForm({...dailyForm, players: e.target.value})}
                className="w-full p-2 rounded bg-gray-100 border border-gray-300 h-32 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="Messi, Maradona, Kempes..."
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Desafío'}
            </motion.button>
          </form>
        )}

        {/* Game 2 Form */}
        {activeTab === 'game2' && (
             <form onSubmit={handleGame2Submit} className="space-y-6 bg-white p-6 rounded-xl border border-white/10 shadow-lg text-navy">
                 <h2 className="text-xl font-bold text-navy">Configurar Desafío Diario (Game 2)</h2>

                 <div>
                     <label className="block text-sm text-gray-600 mb-1 font-semibold">Fecha del Desafío</label>
                     <input
                         type="date"
                         value={game2Form.date}
                         onChange={e => setGame2Form({...game2Form, date: e.target.value})}
                         className="w-full p-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                         required
                     />
                 </div>

                 <div className="space-y-6">
                     {game2Form.stages.map((stage, index) => (
                         <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                             <h3 className="font-bold text-primary mb-3">Nivel {index + 1}</h3>
                             <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div>
                                     <label className="block text-xs font-semibold text-gray-500 mb-1">Equipo A</label>
                                     <select
                                         value={stage.teamA}
                                         onChange={e => updateStage(index, 'teamA', e.target.value)}
                                         className="w-full p-2 rounded bg-white border border-gray-300 text-sm"
                                         required
                                     >
                                         <option value="">Seleccionar Equipo</option>
                                         {shields.map(s => <option key={s} value={s}>{s}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-xs font-semibold text-gray-500 mb-1">Equipo B</label>
                                     <select
                                         value={stage.teamB}
                                         onChange={e => updateStage(index, 'teamB', e.target.value)}
                                         className="w-full p-2 rounded bg-white border border-gray-300 text-sm"
                                         required
                                     >
                                         <option value="">Seleccionar Equipo</option>
                                         {shields.map(s => <option key={s} value={s}>{s}</option>)}
                                     </select>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-xs font-semibold text-gray-500 mb-1">Respuestas Correctas (separadas por coma)</label>
                                 <input
                                     type="text"
                                     value={stage.validPlayers}
                                     onChange={e => updateStage(index, 'validPlayers', e.target.value)}
                                     className="w-full p-2 rounded bg-white border border-gray-300 text-sm"
                                     placeholder="Ej: Enzo Pérez, Enzo Perez, Perez"
                                     required
                                 />
                             </div>
                         </div>
                     ))}
                 </div>

                 <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     type="submit"
                     disabled={loading}
                     className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-50"
                 >
                     {loading ? 'Guardando Game 2...' : 'Guardar Desafío Game 2'}
                 </motion.button>
             </form>
        )}

        {activeTab === 'players' && (
          <div className="bg-white p-6 rounded-xl border border-white/10 text-navy">
             <h2 className="text-xl mb-4 font-bold">Cargar Jugadores (Game 3)</h2>
             <p className="text-gray-600 mb-4">
               Funcionalidad de carga masiva pendiente de implementación.
             </p>
             <button disabled className="px-6 py-2 bg-gray-600 text-white font-bold rounded cursor-not-allowed opacity-50">
               Importar Excel (Próximamente)
             </button>
          </div>
        )}
      </motion.div>
      </main>
      <Footer />
    </div>
  );
}
