import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./Authcontext";
import { useLocation, useParams } from "react-router-dom";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { authData } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState({});
  const [currentBranchIndex, setCurrentBranchIndex] = useState(0);
  const [topMessage, setTopMessage] = useState("");
  const [promptHistory, setPromptHistory] = useState([]);
  const [currentModel, setCurrentModel] = useState("mistral");
  const [lock, setLock] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [renew, setRenew] = useState(false);
  const [isProcessing, setisProcessing] = useState(false);
  const [usage, setUsage] = useState("");
  const [limit, setLimit] = useState("");
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [session, setSession] = useState("");

  const resetChatState = () => {
    setConversations({});
    setCurrentBranchIndex(0);
    setTopMessage("");
    setCurrentModel("mistral");
    setLock(false);
    setShowPopup(false);
    setisProcessing(false);
  };

  useEffect(() => {
    if (!authData || !authData.user) {
      resetChatState(); // Clear chat state when user logs out
    }
  }, [authData]);

  // Log only in development mode
  const log = (...args) => {
    //if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    //}
  };

  useEffect(() => {
    log("Initial ChatContext:", { conversations, currentBranchIndex });
    checkTokenUsage(); // Check token usage on component mount
  }, []);

  
  useEffect(() => {
    let activeSessionId;

if (!session) { // Handles undefined, null, or empty string
  activeSessionId = authData?.sessionId ?? ''; // Fallback to authData.sessionId or empty string if undefined
} else {
  activeSessionId = session;
}

console.log('sessionId :', session);
console.log('activeSessionId :', activeSessionId);
  
    const fetchChatHistory = async () => {
      if (!activeSessionId) return;
  
      try {
        resetChatState();
        const response = await fetch(`http://192.168.0.235:3002/getchat?sessionId=${activeSessionId}`);
        const history = await response.json();
  
        console.log("getchat :", history);
        const processedConversations = {};
  
        Object.keys(history).forEach((branchIndex, index) => {
          processedConversations[`conversation ${index}`] = history[branchIndex].map((message) => {
            let userMessage = message.userMessage;
            let aiMessage = message.aiMessage;
  
            if (Array.isArray(userMessage) && userMessage.length > 0) {
              userMessage = userMessage[userMessage.length - 1]?.userMessage || "";
              aiMessage = userMessage[userMessage.length - 1]?.aiMessage ?? aiMessage;
            } else if (typeof userMessage === "string") {
              try {
                const parsed = JSON.parse(userMessage);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  userMessage = parsed[parsed.length - 1]?.userMessage || userMessage;
                  aiMessage = parsed[parsed.length - 1]?.aiMessage ?? aiMessage;
                }
              } catch (error) {
                console.warn("Invalid message format:", userMessage);
              }
            }
  
            return { userMessage, aiMessage };
          });
        });
  
        if (Object.keys(processedConversations).length > 0) {
          setConversations((prev) => ({ ...prev, ...processedConversations }));
        }
  
        console.log("Updated conversations:", processedConversations);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
  
    fetchChatHistory();
  }, [location, authData.sessionId, session]);
  

  useEffect(() => {
    log("Updated Conversations:", conversations);
  }, [conversations]);

  useEffect(() => {
    log("isArtifact:", isArtifactOpen);
  }, [isArtifactOpen]);


  useEffect(() => {
    log("Updated Current Branch Index:", currentBranchIndex, "Current Model:", currentModel);
  }, [currentBranchIndex, currentModel]);

  // Check Token Usage and Lock/Unlock Chat Accordingly
  const checkTokenUsage = useCallback(async () => {
    const url = `http://192.168.0.235:3002/api/token-usage?username=${authData.user}`;
  
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const data = await response.json();
      log("Token Usage Data:", data.lock);

      setUsage(data.used ?? 0); // Update the used state correctly
      setLimit(data.limit ?? 0);
  
      if (data.lock) {
        setLock(true); // Lock chat if API returns lock = 1
        return true;  // Return false when locked
      } else {
        setLock(false); // Unlock chat if API returns lock = 0
        setShowPopup(false);
        return false;  // Return true when unlocked
      }
  
      return false; // Default to false if data.lock is undefined or unexpected
    } catch (error) {
      console.error("Error checking token usage:", error);
      setLock(true); // Lock UI in case of an error
      return false;
    }
  }, [authData.user]); // Ensure dependency on authData.user
  

  // Periodically Check Token Usage (Auto Unlock if Admin Extends Tokens)
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenUsage();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [checkTokenUsage]);

 // Fetch AI Response
const fetchAIResponse = useCallback(async (branchIndex, model, updatedConversations) => {
  const url = "http://192.168.0.235:3002/callAI";
  log("Fetching AI response...", { url, branchIndex });

  log("Updated Conversations: ", JSON.stringify(updatedConversations));

  const history = updatedConversations[`conversation ${branchIndex}`] || [];

  log("history: ", JSON.stringify(history));

  try {
      const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              history: history,
              sessionId: authData.sessionId,
              branchindex: branchIndex,
              username: authData.user,
              model
          }),
      });

      if (response.status === 429) {
          setRenew(true);
          log("Rate limit exceeded - 429 Too Many Requests");
          return "Your request limit has been reached. If this is due to a token limit, please refresh or try again later.";
      }

      if (response.status === 500) {
          setRenew(true);
          log("Server returned 500 - Internal Server Error");
          return "Something went wrong. Please try again later.";
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      log("AI Response Data:", data);

      return data.result || "No response from AI.";
  } catch (error) {
      setRenew(true);
      console.error("Error fetching AI response:", error);
      return "Please check your connection or try again later.";
  }
}, [authData]);

// Send Message Function with Token Check
const onSendMessage = useCallback(async (userMessage, newIndex) => {
  log(`Attempting to send message. Lock state: ${lock}`);

  if (!userMessage.trim()) {
      console.warn("Cannot send an empty message.");
      return;
  }

  setisProcessing(true);

  try {
      log("Checking token usage before sending message...");
      const isUnlocked = await checkTokenUsage();

      if (!isUnlocked) {
          console.warn("Token limit reached. Cannot send message.");
          setShowPopup(true);
          setLock(true);
          setisProcessing(false);
          return;
      }

      log("User Message:", userMessage, "New Index:", newIndex, "Current Model:", currentModel);

      const newUserMessage = { userMessage, aiMessage: null };

      // Optimistically update conversations state
      setConversations(prev => ({
          ...prev,
          [`conversation ${newIndex}`]: [...(prev[`conversation ${newIndex}`] || []), newUserMessage],
      }));

      log("Fetching AI response...");

      // Fetch AI response
      const aiResponse = await fetchAIResponse(newIndex, currentModel, {
          ...conversations,
          [`conversation ${newIndex}`]: [...(conversations[`conversation ${newIndex}`] || []), newUserMessage]
      });

      if (aiResponse === "Your request limit has been reached. If this is due to a token limit, please refresh or try again later.") {
          setLock(true);
          setShowPopup(true);
      }

      // Update AI response in the conversation
      setConversations(prev => ({
          ...prev,
          [`conversation ${newIndex}`]: prev[`conversation ${newIndex}`].map((msg, i, arr) =>
              i === arr.length - 1 ? { ...msg, aiMessage: aiResponse } : msg
          ),
      }));

  } catch (error) {
      console.error("Error sending message:", error);
  } finally {
      setisProcessing(false);
  }
}, [lock, currentModel, fetchAIResponse, checkTokenUsage]);

  
  // Memoize Context Value for Performance
  const chatContextValue = useMemo(() => ({
    conversations,
    setConversations,
    currentBranchIndex,
    setCurrentBranchIndex,
    topMessage,
    setTopMessage,
    promptHistory,
    setPromptHistory,
    currentModel,
    setCurrentModel,
    onSendMessage,
    showPopup,
    setShowPopup,
    lock,
    setLock,
    isProcessing,
    setisProcessing,
    renew, 
    setRenew,
    usage,
    setUsage,
    limit,
    setLimit,
    isArtifactOpen, 
    setIsArtifactOpen,
    resetChatState,
    session,
    setSession
  }), [conversations, currentBranchIndex, topMessage, promptHistory, currentModel, lock, showPopup, isProcessing, renew, usage, limit,isArtifactOpen, setIsArtifactOpen, resetChatState,session, setSession, onSendMessage]);

  return <ChatContext.Provider value={chatContextValue}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
