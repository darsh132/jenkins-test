import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import Footer from "./Footer";
import { motion } from "framer-motion";
import ChatContainer from "./ChatContainer";
import { useAuth } from "../context/Authcontext";
import { ArrowLeft, Puzzle, Menu, ChevronUp, ChevronDown } from "lucide-react";
import ArtifactsContainer from "./ArtifactsContainer";
import AlertPopup from "./AlertPopup";
import RenewPopup from "./RenewPopup";
import { useChat } from "../context/ChatContext";
import { useArtifact } from "../context/ArtifactContext";

const Dashboard = () => {
  const { authData } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const { artifact, setArtifact } = useArtifact();
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const { conversations, setConversations, topmessage, renew, showPopup, setShowPopup, usage, limit, isArtifactOpen, setIsArtifactOpen, session, setSession } = useChat();

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!authData?.sessionId) {
      navigate('/signin');
      return;
    }
    setSession(sessionId !== 'nc' ? sessionId : authData.sessionId);
  }, [authData?.sessionId, sessionId, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        setShowScrollButtons(scrollTop > 50 || scrollHeight > clientHeight);
      }
    };

    chatContainerRef.current?.addEventListener("scroll", handleScroll);
    return () => chatContainerRef.current?.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="h-full font-serif text-gray-800">
      <div className="fixed bg-[#A9C3FE]/30 backdrop-blur-md border-b border-white/20 shadow-md w-full z-10 flex items-center px-6 py-3">
        <button className="md:hidden flex items-center text-gray-700 hover:text-gray-900 transition-all">
          <Menu size={24} />
        </button>
        <motion.img
          src="https://escanav.com/en/images/escan7.png"
          alt="Logo"
          className="h-12 md:h-14 transition-transform duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        {topmessage && (
          <div className="relative bg-[#e0e7ff] text-blue-500 text-sm md:text-base font-medium px-4 py-2 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg">
            {topmessage}
          </div>
        )}
      </div>

      <Sidebar onSidebarToggle={setIsSidebarPinned} />

      <div className={`relative h-screen flex transition-all duration-500 ease-in-out ${isSidebarPinned ? "ml-52" : "ml-6"}`}>
        <div className={`flex flex-1 p-4 overflow-hidden transition-all duration-500 ease-in-out`}>
          <div className="flex-grow overflow-y-auto custom-scrollbar relative" ref={chatContainerRef}>
            <ChatContainer isProcessing={isProcessing} onStop={() => setIsProcessing(false)} />
          </div>

          {renew && <RenewPopup message="Something went wrong! create a new chat to continue.." />}
          {showPopup && !renew && (
            <AlertPopup
              message="You have exceeded your allocated token limit. Please contact the administrator."
              onClose={() => setShowPopup(false)}
            />
          )}
        </div>

        {artifact.length > 0 && isArtifactOpen && (
          <div className="w-full mt-32 mb-12 max-w-md p-4 items-center shadow-lg relative bg-white">
            <button className="absolute top-3 left-3 text-white flex items-center gap-2" onClick={() => setIsArtifactOpen(false)}>
              <ArrowLeft size={20} /> Back
            </button>
            <ArtifactsContainer />
          </div>
        )}

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute top-20 right-20 transform -translate-x-1/2 bg-white/70 backdrop-blur-lg shadow-md rounded-lg px-4 py-2 text-gray-700 text-sm font-medium"
        >
          Tokens Used: {usage} / {limit || 1500}
        </motion.div>

        {artifact.length > 0 && (
          <button
            className="fixed top-20 right-5 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
            onClick={() => setIsArtifactOpen((prev) => !prev)}
          >
            <Puzzle size={20} />
          </button>
        )}

        {/* Scroll Up & Down Buttons */}
        {showScrollButtons && (
          <div className="fixed bottom-10 right-6 flex flex-col gap-3">
            <button
              className="bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-900 transition"
              onClick={scrollToTop}
            >
              <ChevronUp size={24} />
            </button>
            <button
              className="bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-900 transition"
              onClick={scrollToBottom}
            >
              <ChevronDown size={24} />
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          .custom-scrollbar {
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent; /* thumb and track for Firefox */
}

/* Chrome, Edge, Safari */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
}
        `}
      </style>
    </div>
  );
};

export default Dashboard;
