import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useChat } from "./ChatContext";


// Create Auth Context
const AuthContext = createContext({
  authData: { sessionId: null, user: null },
  login: () => {},
  logout: () => {},
});

// Custom Hook to Use Auth Context
export const useAuth = () => useContext(AuthContext);


// Utility functions for session storage handling
const getStoredAuthData = () => {
  try {
    const storedData = JSON.parse(localStorage.getItem("authData"));
    if (storedData && storedData.sessionId && storedData.user) {
      return storedData;
    }
  } catch (error) {
    console.error("Error reading auth data:", error);
  }
  return { sessionId: null, user: null };
};

const setStoredAuthData = (sessionId, user) => {
  if (sessionId && user) {
    const authData = JSON.stringify({ sessionId, user, timestamp: Date.now() });
    localStorage.setItem("authData", authData);
  } else {
    localStorage.removeItem("authData");
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authData, setAuthData] = useState(getStoredAuthData);
  const chatContext = useChat();
  const resetChatState = chatContext?.resetChatState || (() => {});

  // Function to extract query parametersl
  const getQueryParam = (param) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(param);
  };

  // Check query params for user login (for initial login via URL params)
  useEffect(() => {
    const queryUser = getQueryParam("user");
    if (queryUser) {
      const sessionId = "admin"; // Assign fixed session ID for admin access
      setStoredAuthData(sessionId, queryUser);
      setAuthData({ sessionId, user: queryUser });
    }
  }, [location.search]); // Runs only when query params change

  // Function to validate session
  const isSessionValid = () => {
    const storedData = getStoredAuthData();
    if (!storedData.sessionId || !storedData.user) {
      return false;
    }
    
    // Optional: Implement session expiration logic
    const sessionDuration = 60 * 60 * 1000; // 1 hour
    const now = Date.now();
    return now - storedData.timestamp < sessionDuration;
  };

  // Fetch new chat when navigating to /nc
  useEffect(() => {
    const fetchNewChat = async () => {
      console.log("Fetch New Is Called!");
      try {
        const response = await fetch(
          `http://192.168.0.235:3002/newchat?username=${authData.user}`
        );
        const data = await response.json();
        console.log("data :", data);
        if (data.sessionId) {
          setStoredAuthData(data.sessionId, authData.user);
          setAuthData({ sessionId: data.sessionId, user: authData.user });
          console.log(resetChatState);
          resetChatState();
        }
      } catch (error) {
        console.error("Error fetching new chat:", error);
      }
    };

    if (location.pathname === "/nc") {
      fetchNewChat();
    }
  }, [location.pathname]); // Triggers only when path changes to /nc

  // Sync auth state across tabs
  useEffect(() => {
    const syncAuth = (event) => {
      if (event.key === "authData") {
        setAuthData(getStoredAuthData());
      }
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // Login function
  const login = (sessionId, username) => {
    setStoredAuthData(sessionId, username);
    setAuthData({ sessionId, user: username });
  };

  // Logout function
  const logout = () => {
    setStoredAuthData(null, null);
    setAuthData({ sessionId: null, user: null });

    // Clear storage for security
    localStorage.removeItem("authData");
    sessionStorage.clear();
    resetChatState();
    navigate("/signin", { replace: true });
  };

  // Auto logout if session is invalid
  useEffect(() => {
    if (!isSessionValid()) {
      logout();
    }
  }, []);

  // Memoize context value for performance optimization
  const authContextValue = useMemo(() => ({ authData, login, logout }), [authData]);

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
