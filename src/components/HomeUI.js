import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StartChat from "./startchat.js";
import RecentChats from "./recentchats.js";
import { Sidebar } from "./Sidebar.js";
import { ChevronRight, Sparkles, Shield } from "lucide-react";

// Floating animation
const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

function AnimatedGradientText({ children }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        backgroundPosition: ["0% center","200% center"]
      }}
      transition={{
        duration: 2,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 5 // Adds a 1.5s pause before repeating
      }}
      className="inline-block bg-gradient-to-r from-[#224aff] via-[#091977] to-[#fbff1b] bg-[length:200%_100%] bg-clip-text text-transparent"
    >
      {children}
    </motion.span>
  );
}

function HomeUI({ isPinned, setIsPinned }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(isPinned);

  useEffect(() => {
    document.body.classList.add("bg-bg1");
    window.scrollTo(0, 0);
    const timeout = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleSidebarToggle = (pinned) => {
    setIsSidebarPinned(pinned);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen font-zilla"
    >
      <Sidebar onSidebarToggle={handleSidebarToggle} />
      <motion.div
        animate={{ x: isSidebarPinned ? 100 : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="relative flex-1 flex flex-col items-center justify-center px-4 py-10"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div {...floatAnimation} className="absolute top-20 -left-32 w-64 h-64 rounded-full bg-[#224aff]/10 blur-3xl" />
          <motion.div {...floatAnimation} className="absolute bottom-20 -right-32 w-80 h-80 rounded-full bg-[#fbff1b]/5 blur-3xl" />
        </div>

        <motion.div className="m-auto w-full md:max-w-2xl flex flex-col items-center space-y-10">
          <motion.div className="relative flex text-white items-center rounded-full border px-4 py-2 bg-white/20 backdrop-blur-lg hover:scale-105 transition-all">
            <Sparkles className="mr-2 size-4 text-[#1b50ff]" />
            <AnimatedGradientText>
              Introducing eScan Secure AI <ChevronRight className="ml-1 inline-block size-3 transition-transform group-hover:translate-x-1" />
            </AnimatedGradientText>
          </motion.div>

          <motion.div className="flex flex-col items-center">
          <motion.img
  src="https://escanav.com/en/images/escan7.png"
  alt="eScan Secure AI Logo"
  className="object-contain"
  transition={{ duration: 0.8, ease: "easeOut" }}
/>

            <motion.p className="text-2xl text-text1 font-bold bg-gradient-to-r from-[#224aff] via-[#091977] to-[#002f61] bg-clip-text text-transparent">
            Secure AI
            </motion.p>
           
          </motion.div>

          <AnimatePresence>
            <motion.div className="w-full flex flex-col items-center space-y-8">
              <motion.div whileHover={{ scale: 1.02 }} className="w-full">
                <StartChat />
              </motion.div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#224aff]/30 to-transparent" />
              <motion.div whileHover={{ scale: 1.01 }} className="w-full">
                <RecentChats />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default HomeUI;
