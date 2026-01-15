export default function Footer() {
  return (
    <footer className="w-full bg-background py-8 border-t border-white/5 mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center relative z-10">
        <p className="text-gray-400 text-sm font-sans">
          © {new Date().getFullYear()} Fútbol 11 Argentino.
        </p>
        <div className="bg-white rounded-full p-1.5 h-10 w-10 shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-300">
            <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
            />
        </div>
      </div>
    </footer>
  );
}
