import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";

const RenewPopup = ({ message }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-red-500 text-white backdrop-blur-md border border-red-400 shadow-lg px-4 py-2 rounded-lg flex items-center gap-2 max-w-sm w-full text-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <XCircle size={20} className="text-white" />
          <p className="flex-1 text-sm font-medium">{message}</p>
          <a
            href="/nc"
            className="bg-white text-red-500 px-2 py-1 rounded-md hover:bg-gray-100 transition text-sm font-medium"
          >
            New Chat
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RenewPopup;
