import GameLayout from '../components/GameLayout';

export default function Game2() {
  return (
    <GameLayout title="Juego 2">
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl text-gold mb-4">Próximamente</h2>
        <p className="text-gray-300">Este juego está en desarrollo.</p>
      </div>
    </GameLayout>
  );
}
