import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, Settings, HelpCircle, LogOut, ArrowRightToLine, MessageCircle, ChevronUp, PanelLeft } from "lucide-react";
import { NavItem } from "./NavItem";
import { motion } from "framer-motion";
import { Avatar } from "./Actions";
import { useAuth } from "../context/Authcontext";
import { useChat } from "../context/ChatContext";
import { Link } from "react-router-dom";

export function Sidebar({ onSidebarToggle }) {
  const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(false);
  const { promptHistory, setPromptHistory } = useChat();
  const [error, setError] = useState(null);
  const { logout, authData } = useAuth();

  useEffect(() => {
    onSidebarToggle(isPinned);
  }, [isPinned, onSidebarToggle]);

  useEffect(() => {
    const fetchPromptHistory = async () => {
      if (!authData?.user) return;
      try {
        const response = await fetch(`http://192.168.0.235:3002/getsessions?username=${authData.user}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const prompthistory = await response.json();
        if (!Array.isArray(prompthistory)) throw new Error("Invalid response format");

        const formattedHistory = prompthistory.flatMap(session => {
          return session.messages.map(message => ({
            sessionId: session.sessionId,
            message: message.userMessage || "(No message)"
          }));
        });

        setPromptHistory(formattedHistory);
      } catch (err) {
        console.error("Error fetching prompt history:", err);
        setError(err.message);
      }
    };

    fetchPromptHistory();
  }, [authData?.user]);

  const handlePinToggle = () => {
    if (window.innerWidth >= 768) setIsPinned(!isPinned);
  };

  const logoutUser = async () => {
    if (!authData?.user) return;
    try {
      const response = await fetch(`http://192.168.0.235:3002/logout?username=${authData.user}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      logout();
    } catch (err) {
      console.error("Logout failed:", err);
      setError(err.message);
    }
  };

  return (
    <div
      aria-label="Sidebar"
      className={`fixed left-0 top-0 h-screen text-black transition-all duration-500 ease-in-out transform ${isExpanded || isPinned ? "w-64 bg-[#e0e7ff] bg-opacity-30 backdrop-blur-md border border-black/20 shadow-2xl rounded-xl z-10" : "w-16"}`}
      onMouseEnter={() => !isPinned && setIsExpanded(true)}
      onMouseLeave={() => !isPinned && setIsExpanded(false)}
    >
      <div className="flex items-center justify-between p-4">
        {(isExpanded || isPinned) && (
          <>
            <motion.img
              src="https://escanav.com/en/images/escan7.png"
              alt="Logo"
              className="h-16"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            <button className="flex justify-end" onClick={handlePinToggle}>
              <ArrowRightToLine size={20} className={isPinned ? "text-blue-500" : "text-gray-500"} />
            </button>
          </>
        )}
      </div>

      <div className="flex h-full flex-col">
        <button className={`text-sm flex rounded-lg bg-[#DFE4F7] items-center font-bold m-4 p-4 transition-opacity duration-300 ${isExpanded || isPinned ? "border-2 border-blue-100" : "hidden"}`}>
          <a href="/nc">{isExpanded ? "Start New Chat" : ""}</a>
          <MessageCircle size={20} className="text-blue-500" />
        </button>

        <nav className="flex-1 space-y-4 mt-12 px-4">
          <NavItem label="Recents" isExpanded={isExpanded || isPinned} />

          {error && <p className="text-red-500 text-sm">Error: {error}</p>}

          {promptHistory.length > 0 ? (
            promptHistory.slice(0, 4).map((prompt, index) => (
              <NavItem
                key={index}
                subLabel={prompt.message.length > 20 ? `${prompt.message.slice(0, 20)}...` : prompt.message}
                href={`/c/${prompt.sessionId}`}
                icon={<MessageCircle size={20} className="text-blue-400" />}
                isExpanded={isExpanded || isPinned}
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm">{isExpanded ? "No recent prompts" : ""}</p>
          )}

          {promptHistory.length > 4 && (
            <button
            className={`text-sm flex items-center ml-6 font-bold mt-4 transition-opacity duration-300 ${
              isExpanded || isPinned ? "opacity-100" : "hidden"
            }`}
            onClick={() => navigate('/view-all-chats')} // Corrected this line
          >
            View All <ArrowRightToLine size={20} className="ml-2" />
          </button>
          
          )}

          <div className="fixed inset-x-0 bottom-24 px-4">
            <button
              className={`text-sm flex items-center ml-6 font-bold mt-4 transition-opacity duration-300 ${isExpanded || isPinned ? "opacity-100" : "hidden"}`}
              onClick={logoutUser}
            >
              Logout <LogOut size={20} className="ml-2" />
            </button>
            <PanelLeft size={20} className="m-4" />
          </div>

          <div className={`fixed p-4 rounded-lg mr-4 bottom-8 w-52 flex ${isExpanded ? "bg-[#DFE4F7] border border-blue-100" : ""}`}>
            <Avatar role={authData?.user?.charAt(0) || "?"} />
            <NavItem icon={<ChevronUp size={20} />} label={authData?.user} isExpanded={isExpanded || isPinned} />
          </div>
        </nav>
      </div>
    </div>
  );
}
