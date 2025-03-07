import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

const TypingEffect = ({ elements, delay = 1000 }) => {
  const [visibleElements, setVisibleElements] = useState([]);
  const timeoutRef = useRef(null);

  const addElement = useCallback(() => {
    setVisibleElements((prev) => {
      if (prev.length < elements.length) {
        return [...prev, elements[prev.length]];
      }
      return prev;
    });
  }, [elements]);

  useEffect(() => {
    if (visibleElements.length < elements.length) {
      timeoutRef.current = setTimeout(addElement, delay);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [visibleElements, addElement, delay]);

  return (
    <div className="flex flex-col gap-2">
      {visibleElements.map((element, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {element}
        </motion.div>
      ))}
    </div>
  );
};

export default TypingEffect;
