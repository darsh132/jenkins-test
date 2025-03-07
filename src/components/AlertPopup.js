import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

const AlertPopup = ({ message, onClose }) => {
  return (
    <motion.div
      className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-white border border-red-200 shadow-lg px-6 py-3 rounded-xl flex items-center gap-3 max-w-md w-full"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
    >
      <XCircle size={24} className="text-red-500" />
      <p className="text-black flex-1">{message}</p>
      <button
        className="text-red-500 hover:text-red-600 transition"
        onClick={onClose}
      >
        ✕
      </button>
    </motion.div>
  );
};

export default AlertPopup;
