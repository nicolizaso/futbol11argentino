import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
    return <div className="p-8 text-center text-white">Acceso denegado. <button onClick={() => navigate('/login')} className="underline">Iniciar Sesión</button></div>;
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
    <div className="min-h-screen bg-navy text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl text-gold mb-6">Panel de Administración</h1>

        <div className="flex space-x-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-2 px-4 ${activeTab === 'daily' ? 'border-b-2 border-gold text-gold' : 'text-gray-400'}`}
          >
            Desafío Diario
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`pb-2 px-4 ${activeTab === 'players' ? 'border-b-2 border-gold text-gold' : 'text-gray-400'}`}
          >
            Jugadores (Game 3)
          </button>
        </div>

        {message && <div className="bg-green-500/20 text-green-400 p-4 rounded mb-6">{message}</div>}

        {activeTab === 'daily' && (
          <form onSubmit={handleDailySubmit} className="space-y-4 bg-slate p-6 rounded-lg">
            <h2 className="text-xl mb-4">Configurar Desafío Diario (Juego 1)</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha</label>
                <input
                  type="date"
                  value={dailyForm.date}
                  onChange={e => setDailyForm({...dailyForm, date: e.target.value})}
                  className="w-full p-2 rounded bg-white/10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cantidad de Jugadores</label>
                <input
                  type="number"
                  value={dailyForm.count}
                  onChange={e => setDailyForm({...dailyForm, count: e.target.value})}
                  className="w-full p-2 rounded bg-white/10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Equipo 1</label>
                <input
                  type="text"
                  value={dailyForm.team1}
                  onChange={e => setDailyForm({...dailyForm, team1: e.target.value})}
                  className="w-full p-2 rounded bg-white/10"
                  placeholder="Ej: River Plate"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Equipo 2</label>
                <input
                  type="text"
                  value={dailyForm.team2}
                  onChange={e => setDailyForm({...dailyForm, team2: e.target.value})}
                  className="w-full p-2 rounded bg-white/10"
                  placeholder="Ej: Boca Juniors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Jugadores Válidos (separados por coma)</label>
              <textarea
                value={dailyForm.players}
                onChange={e => setDailyForm({...dailyForm, players: e.target.value})}
                className="w-full p-2 rounded bg-white/10 h-32"
                placeholder="Messi, Maradona, Kempes..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gold text-white font-bold rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Desafío'}
            </button>
          </form>
        )}

        {activeTab === 'players' && (
          <div className="bg-slate p-6 rounded-lg">
             <h2 className="text-xl mb-4">Cargar Jugadores (Game 3)</h2>
             <p className="text-gray-400 mb-4">
               Funcionalidad de carga masiva pendiente de implementación (requiere librería XLSX).
               Por ahora usar la consola de Firebase.
             </p>
             <button disabled className="px-6 py-2 bg-gray-600 text-white font-bold rounded cursor-not-allowed">
               Importar Excel (Próximamente)
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
