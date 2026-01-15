import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="bg-white rounded-full p-4 h-32 w-32 shadow-md flex items-center justify-center"
      >
        <img
          src="/logo.png"
          alt="Loading..."
          className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(116,172,223,0.5)]"
        />
      </motion.div>
    </div>
  );
}
