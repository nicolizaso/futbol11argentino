export default function Footer() {
  return (
    <footer className="w-full bg-background py-8 border-t border-white/5 mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center relative z-10">
        <p className="text-gray-400 text-sm font-sans">
          © {new Date().getFullYear()} Fútbol 11 Argentino.
        </p>
        <img
            src="/logo.png"
            alt="Logo"
            className="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
        />
      </div>
    </footer>
  );
}
