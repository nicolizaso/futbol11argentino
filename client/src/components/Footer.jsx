export default function Footer() {
  return (
    <footer className="w-full bg-navy py-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Fútbol 11 Argentino. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
