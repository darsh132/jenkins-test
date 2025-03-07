import { useChat } from "../context/ChatContext.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar.js";
import { ChevronLeft, MessageCircle, Menu } from "lucide-react";
import ChatCard from "./chatcard.js";

function ViewAllChats() {
  const { promptHistory, topmessage } = useChat();
  const navigate = useNavigate();
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [collapseChats, setCollapseChats] = useState(false);

  useEffect(() => {
    document.body.classList.add("bg-gradient-to-b", "from-gray-900", "to-black", "min-h-screen");
    window.scrollTo(0, 0);
  }, []);

  const handleSidebarToggle = (pinned) => {
    setIsSidebarPinned(pinned);
  };

  return (
    <div className="relative min-h-screen text-blue-600">
      <div className="fixed bg-[#e0e7ff] bg-opacity-30 backdrop-blur-lg shadow-lg w-full z-10 flex items-center px-6 py-4 border-b border-white/20">
        <button className="md:hidden flex items-center text-gray-200 hover:text-white transition-all">
          <Menu size={24} />
        </button>
        <motion.img
          src="https://escanav.com/en/images/escan7.png"
          alt="Logo"
          className="h-12 md:h-14 transition-transform duration-300 hover:scale-110 drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        <div className="relative ml-4 flex items-center">
          <div className="bg-[#e0e7ff] text-blue-500 text-sm md:text-base font-medium px-5 py-2 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
            {topmessage}
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex min-h-screen">
        <Sidebar onSidebarToggle={handleSidebarToggle} />
        <div className={`transition-all duration-500 ease-in-out mt-28 flex flex-col w-full items-center ${isSidebarPinned ? "md:pl-24" : "md:pl-5"}`}>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full max-w-3xl sticky top-20 z-10 backdrop-blur-lg bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between items-center shadow-lg rounded-xl">
            <h1 className="text-lg font-semibold text-blue-400">All Chats</h1>
            <button onClick={() => navigate(-1)} className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all">
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2">Back</span>
            </button>
          </motion.div>

          <motion.div
            className="w-full max-w-3xl mx-auto mt-16 px-5 flex flex-col gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            <AnimatePresence>
              {promptHistory.length > 0 ? (
                promptHistory.map((chat, index) => (
                  <ChatCard
                    key={chat.sessionId}
                    chat={chat}
                    isCollapsed={collapseChats}
                    delay={index * 50}
                  />
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center text-gray-400 mt-10 text-lg"
                >
                  No chat history available.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default ViewAllChats;
