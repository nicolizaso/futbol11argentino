import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function Admin() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form States
  const [dailyForm, setDailyForm] = useState({
    game: 'juego1', date: '', team1: '', team2: '', players: '', count: 10
  });

  if (!currentUser) {
    // Basic protection, ideally check for admin role in DB
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
      setMessage('Desafío guardado correctamente.');
    } catch (error) {
      console.error(error);
      setMessage('Error al guardar desafío.');
    } finally {
      setLoading(false);
    }
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

        <div className="flex space-x-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-2 px-4 transition-colors ${activeTab === 'daily' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            Desafío Diario
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`pb-2 px-4 transition-colors ${activeTab === 'players' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            Jugadores (Game 3)
          </button>
        </div>

        {message && <div className="bg-green-500/20 text-green-400 p-4 rounded-lg border border-green-500/30 mb-6">{message}</div>}

        {activeTab === 'daily' && (
          <form onSubmit={handleDailySubmit} className="space-y-4 bg-white p-6 rounded-xl border border-white/10 shadow-lg text-navy">
            <h2 className="text-xl mb-4 font-bold text-navy">Configurar Desafío Diario (Juego 1)</h2>

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

        {activeTab === 'players' && (
          <div className="bg-white p-6 rounded-xl border border-white/10 text-navy">
             <h2 className="text-xl mb-4 font-bold">Cargar Jugadores (Game 3)</h2>
             <p className="text-gray-600 mb-4">
               Funcionalidad de carga masiva pendiente de implementación (requiere librería XLSX).
               Por ahora usar la consola de Firebase.
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
