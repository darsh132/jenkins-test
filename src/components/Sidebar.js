import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Home, Settings, HelpCircle, LogOut, ArrowRightToLine,
  MessageCircle, ChevronUp, PanelLeft
} from "lucide-react";
import { NavItem } from "./NavItem";
import { motion } from "framer-motion";
import { Avatar } from "./Actions";
import { useAuth } from "../context/Authcontext";
import { useChat } from "../context/ChatContext";

export function Sidebar({ onSidebarToggle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { promptHistory, setPromptHistory } = useChat();
  const { logout, authData } = useAuth();

  useEffect(() => {
    onSidebarToggle(isPinned);
  }, [isPinned, onSidebarToggle]);

  useEffect(() => {
    const fetchPromptHistory = async () => {
      if (!authData?.user) return;
      try {
        const username = encodeURIComponent(authData.user);
        const response = await fetch(`http://192.168.0.235:3002/getsessions?username=${username}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const sessions = await response.json();
        if (!Array.isArray(sessions)) throw new Error("Invalid response format");

        const formatted = sessions.flatMap(session => {
          return session.messages.map(msg => ({
            sessionId: session.sessionId,
            message: msg.userMessage || "(No message)"
          }));
        });

        setPromptHistory(formatted);
      } catch (err) {
        console.error("Fetch failed:", err);
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
      const username = encodeURIComponent(authData.user);
      const response = await fetch(`http://192.168.0.235:3002/logout?username=${username}`);
      if (!response.ok) throw new Error(`Logout failed: ${response.status}`);
      logout();
    } catch (err) {
      console.error("Logout failed:", err);
      setError(err.message);
    }
  };

  return (
    <div
      aria-label="Sidebar"
      className={`fixed left-0 top-0 h-screen text-black transition-all duration-500 ease-in-out transform z-50 ${
        isExpanded || isPinned
          ? "w-64 sidebar-bg border border-white/20  shadow-2xl rounded-xl"
          : "w-16"
      }`}
      onMouseEnter={() => !isPinned && setIsExpanded(true)}
      onMouseLeave={() => !isPinned && setIsExpanded(false)}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between p-4">
        {(isExpanded || isPinned) && (
          <>
            <motion.img
              src="https://escanav.com/en/images/escan7.png"
              alt="Logo"
              className="h-12 w-auto object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            />
            <button
              className="ml-auto p-1"
              aria-label="Toggle Pin Sidebar"
              onClick={handlePinToggle}
            >
              <ArrowRightToLine size={20} className={isPinned ? "text-blue-500" : "text-gray-500"} />
            </button>
          </>
        )}
      </div>

      {/* Navigation Content */}
      <div className="flex flex-col justify-between h-full">
        <div>
          {(isExpanded || isPinned) && (
            <Link
              to="/nc"
              className="flex items-center gap-2 bg-[#DFE4F7] rounded-lg border-2 border-blue-100 m-4 p-3 font-semibold text-sm transition hover:bg-blue-100"
            >
              <MessageCircle size={18} className="text-blue-500" />
              <span>Start New Chat</span>
            </Link>
          )}

          <nav className="mt-6 space-y-4 px-4">
            <NavItem label="Recents" isExpanded={isExpanded || isPinned} />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {promptHistory.length > 0 ? (
              promptHistory.slice(0, 4).map((prompt, i) => (
                <NavItem
                  key={i}
                  subLabel={prompt.message.length > 20 ? `${prompt.message.slice(0, 20)}...` : prompt.message}
                  href={`/c/${prompt.sessionId}`}
                  icon={<MessageCircle size={20} className="text-blue-400" />}
                  isExpanded={isExpanded || isPinned}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">{(isExpanded || isPinned) && "No recent prompts"}</p>
            )}

            {promptHistory.length > 4 && (
              <button
                onClick={() => navigate("/view-all-chats")}
                className={`flex items-center font-semibold text-sm ml-6 mt-4 transition-opacity ${
                  isExpanded || isPinned ? "opacity-100" : "hidden"
                }`}
              >
                View All <ArrowRightToLine size={18} className="ml-2" />
              </button>
            )}
          </nav>
        </div>

        {/* Footer Section */}
        <div className="px-4 mb-4">
          <button
            onClick={logoutUser}
            className={`flex items-center text-sm font-semibold mt-2 ml-2 transition-opacity ${
              isExpanded || isPinned ? "opacity-100" : "hidden"
            }`}
          >
            Logout <LogOut size={18} className="ml-2" />
          </button>

          <div className="mt-6 flex items-center gap-2 p-3 bg-[#DFE4F7] border border-blue-100 rounded-lg">
            <Avatar role={authData?.user?.charAt(0) || "?"} />
            {(isExpanded || isPinned) && (
              <NavItem icon={<ChevronUp size={20} />} label={authData?.user} isExpanded />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
