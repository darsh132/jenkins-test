import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/Authcontext";
import SignIn from "./components/SignIn";
import Dashboard from "./components/Dashboard";
import { ArtifactProvider } from "./context/ArtifactContext";
import HomeUI from "./components/HomeUI";
import { ChatProvider } from "./context/ChatContext";
import ViewAllChats from "./components/ViewAllChats";
import Spinner from "./components/Spinner";
import { RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import Time from "./components/Time";


function App() {
  return (
    <Router>
      <AuthProvider>
        <ArtifactProvider>
          <ChatProvider>
            <MainContent />
          </ChatProvider>
        </ArtifactProvider>
      </AuthProvider>
    </Router>
  );
}

const MainContent = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, [location]);

  const handleRefresh = () => {
    setLoading(true);
    setKey((prevKey) => prevKey + 1);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="bg-gradient-to-t from-[#EEF2FF] via-[#A9C3FE] to-[#DFE4F7] min-h-screen relative flex flex-col items-center justify-center">
      {/* Refresh Button with Animation */}
      <motion.button
  onClick={handleRefresh}
  className="absolute z-50 top-4 right-4 p-3 shadow-lg rounded-full bg-gradient-to-r from-[#A9C3FE] to-[#DFE4F7] hover:from-[#8299E3] hover:to-[#C6D0F2] transition-all duration-300 ease-in-out"
  whileHover={{ scale: 1.2, boxShadow: "0px 0px 15px rgba(169, 195, 254, 0.6)" }}
  whileTap={{ scale: 0.9 }}
  animate={{ rotate: loading ? 360 : 0 }}
  transition={{ duration: 0.6, ease: "easeInOut" }}
>
  <RotateCcw className="w-6 h-6 text-gray-700" />
</motion.button>

      
      {loading ? (
        <Spinner />
      ) : (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/home" element={<HomeUI />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/c/:sessionId" element={<Dashboard />} />
            <Route path="/nc" element={<Dashboard />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/view-all-chats" element={<ViewAllChats />} />
            <Route path="/timeline" element={<Time />} />
          </Routes>
        </motion.div>
      )}
    </div>
  );
};

export default App;