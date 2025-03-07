import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useChat } from "../context/ChatContext";

export function NavItem({ icon, label, href, subLabel, isExpanded }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setTopMessage } = useChat();

  useEffect(() => {
    setLoading(false); // Reset loading state when component re-renders
  }, [href]);

  const handleNavigation = (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple clicks

    setLoading(true);
    setTopMessage(subLabel);
    navigate(href, { replace: true }); // Ensures navigation happens only once
  };

  return (
    <div
      onClick={handleNavigation}
      className="group flex items-center rounded-lg transition-all cursor-pointer px-4 py-2 hover:bg-gray-100 active:scale-95"
    >
      {icon && isExpanded && <span className="mr-2 text-blue-600">{icon}</span>}

      <div
        className={`flex flex-col transition-opacity duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-text-300 mt-1 text-sm font-medium">{label}</span>

        {subLabel && (
          <span className="text-sm p-2 rounded-lg hover:bg-blue-100 text-gray-500 flex items-center gap-2">
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              </motion.div>
            ) : (
              <span>{subLabel}</span>
            )}
          </span>
        )}
      </div>

      {!isExpanded && (
        <div className="fixed left-16 ml-2 rounded bg-gray-800 px-2 py-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
          {label}
        </div>
      )}
    </div>
  );
}