import { motion } from 'framer-motion';

export default function LevelSelector({ teams, onSelectLevel, completedLevels }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl text-center mb-4">Seleccioná un Nivel</h2>
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[120px_repeat(10,1fr)] gap-2 mb-2 font-bold text-center text-sm">
            <div className="text-left px-2">Equipo</div>
            {[...Array(10)].map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {teams.map((team) => (
            <div key={team.id} className="grid grid-cols-[120px_repeat(10,1fr)] gap-2 mb-2 items-center">
              <div className="text-sm px-2 truncate">{team.name}</div>
              {[...Array(10)].map((_, i) => {
                const level = i + 1;
                const isCompleted = completedLevels[team.id]?.includes(level);
                return (
                  <motion.button
                    key={level}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSelectLevel(team.id, level, team.name)}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                      ${isCompleted
                        ? 'bg-gold text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : level}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
