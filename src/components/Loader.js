import React from 'react';
import { motion } from "framer-motion";

const Loader = () => (
  <motion.div
    className="flex items-center space-x-2 text-gray-500 text-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  >
    <motion.span
      className="animate-pulse"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
    >
      Assistant is typing
    </motion.span>

    <motion.div
      className="flex space-x-1"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.2 } },
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-gray-500 rounded-full"
          variants={{
            hidden: { opacity: 0, y: 0 },
            visible: {
              opacity: 1,
              y: [0, -3, 0],
              transition: { duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
            },
          }}
        />
      ))}
    </motion.div>
  </motion.div>
);

export default Loader;
