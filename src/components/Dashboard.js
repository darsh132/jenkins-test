import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import Footer from "./Footer";
import { motion } from "framer-motion";
import ChatContainer from "./ChatContainer";
import { useAuth } from "../context/Authcontext";
import { ArrowLeft, Puzzle, Menu, ChevronUpIcon } from "lucide-react";
import ArtifactsContainer from "./ArtifactsContainer";
import AlertPopup from "./AlertPopup";
import RenewPopup from "./RenewPopup";
import { useChat } from "../context/ChatContext";
import { useArtifact } from "../context/ArtifactContext";

const Dashboard = () => {
  const { authData } = useAuth(); 
  const navigate = useNavigate();
  const { sessionId, nc } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [lastSession, setLastSession] = useState("");
  const { artifact, setArtifact } = useArtifact();
  const contextWindowLimit = 10; 

  const { conversations , setConversations, currentBranchIndex, setCurrentBranchIndex, topmessage, resetChatState, setTopMessage, lock, setLock, onSendMessage, showPopup, setShowPopup, renew, usage, limit, isArtifactOpen, setIsArtifactOpen,session,setSession } = useChat();
  

  useEffect(() => {
    console.log("Child Component - Conversations Updated:", conversations);
  }, [conversations]);


  useEffect(() => {
    if (!authData?.sessionId) {
      navigate('/signin'); 
      return; 
    }
  
    if (sessionId !== 'nc') {
      setSession(sessionId);
    } else {
      setSession(authData.sessionId);
    }
  }, [authData?.sessionId, sessionId, navigate]);
  

  
  const handleSidebarToggle = (isPinned) => {
    setIsSidebarPinned(isPinned);
  };

  return (
    <div className="h-full font-serif text-gray-800">
     <div className="fixed bg-[#e0e7ff] bg-opacity-20 backdrop-blur-md  shadow-md w-full z-10 flex items-center px-6 py-3 ">
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
  <div className="relative ml-4 flex items-center">
  {topmessage && (
  <div className="relative bg-[#e0e7ff] text-blue-500 text-sm md:text-base font-medium px-4 py-2 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg">
    {topmessage}
    <div className="absolute -top-2 left-0 transform -translate-x-2">
      <svg
        className="w-4 h-4 text-blue-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.07-9.93a1 1 0 00-1.41 0L9 10.93 7.34 9.27a1 1 0 00-1.41 1.42l2.37 2.36a1 1 0 001.41 0l3.36-3.36a1 1 0 000-1.41z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  </div>
)}

  </div>
      </div>
      <Sidebar onSidebarToggle={handleSidebarToggle} />
      <div
      className={`relative h-screen flex transition-all duration-500 ease-in-out ${
        isSidebarPinned ? "ml-52" : "ml-6"
      }`}
    >
      <div
        className={`flex flex-1 ${artifact.length > 0 ? "lg:grid" : ""} p-4 overflow-hidden transition-all duration-500 ease-in-out`}
      >
        <div className="flex-grow overflow-y-auto custom-scrollbar">
        <ChatContainer
  isProcessing={isProcessing}
  onStop={() => setIsProcessing(false)}
/>
        </div>
        {renew && (
    <RenewPopup
        message="Something went wrong! create a new chat to continue.."
    />
)}
{showPopup && !renew && (
    <AlertPopup
        message="You have exceeded your allocated token limit. Please contact the administrator."
        onClose={() => setShowPopup(false)}
    />
)}
      </div>
      {artifact.length > 0 && isArtifactOpen && (
          <div className="w-full mt-32 mb-12 max-w-md p-4 items-center shadow-lg relative bg-white">
            <button
              className="absolute top-3 left-3 text-white flex items-center gap-2"
              onClick={() => setIsArtifactOpen(false)}
            >
              <ArrowLeft size={20} /> Back
            </button>
            <ArtifactsContainer/>
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
          className="fixed top-20  right-5 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
          onClick={() => setIsArtifactOpen((prev) => !prev)}
        >
          <Puzzle size={20} /> 
        </button>
          )}
    </div>
    <style>
  {`
    .custom-scrollbar::-webkit-scrollbar {
      width: 0px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
    }
  `}
</style>
    </div>
  );
};

export default Dashboard;
