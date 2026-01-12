import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function GameLayout({ title, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col">
      <header className="flex items-center px-4 py-4 bg-slate sticky top-0 z-10 shadow-md">
        <button
          onClick={() => navigate('/')}
          className="mr-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gold" />
        </button>
        <h1 className="text-xl font-display text-gold flex-grow text-center pr-10">{title}</h1>
      </header>

      <main className="flex-grow p-4 container mx-auto max-w-2xl">
        {children}
      </main>
    </div>
  );
}
