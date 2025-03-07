import React, { useRef, useLayoutEffect, useState, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Message } from "./Actions";
import { useAuth } from "../context/Authcontext";
import { useChat } from "../context/ChatContext";
import HomeUI from "./HomeUI";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/outline";
import Loader from "./Loader";

const Footer = lazy(() => import("./Footer")); // Lazy load Footer component

const ChatContainer = ({ onStop, onRegenerate }) => {
  const containerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const { authData } = useAuth();
  const { conversations = {}, currentBranchIndex, setCurrentBranchIndex, isProcessing } = useChat();
  const [currentModel, setCurrentModel] = useState('gpt');
  const [isAtBottom, setIsAtBottom] = useState(true);

  const currentConversation = useMemo(() => (
    conversations?.[`conversation ${currentBranchIndex}`] ?? []
  ), [conversations, currentBranchIndex]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [currentConversation, isProcessing, scrollToBottom, isAtBottom]);

  const handleConversationSwitch = useCallback((direction) => {
    const newIndex = currentBranchIndex + direction;
    if (newIndex >= 0 && newIndex < Object.keys(conversations).length) {
      setCurrentBranchIndex(newIndex);
    }
  }, [currentBranchIndex, conversations, setCurrentBranchIndex]);

  return (
    <div className="relative flex-1 mt-16 mb-32 mr-12 overflow-hidden">
      {Object.keys(conversations).length > 0 && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center bg-white/50 backdrop-blur-lg shadow-md rounded-full px-4 py-2"
        >
          <button
            onClick={() => handleConversationSwitch(-1)}
            disabled={currentBranchIndex === 0}
            className="p-2 transition-all text-blue-500 hover:text-blue-600 disabled:text-gray-300"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-gray-700 text-sm font-medium mx-3">
            {currentBranchIndex + 1} / {Object.keys(conversations).length}
          </span>
          <button
            onClick={() => handleConversationSwitch(1)}
            disabled={currentBranchIndex >= Object.keys(conversations).length - 1}
            className="p-2 transition-all text-blue-500 hover:text-blue-600 disabled:text-gray-300"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </motion.div>
      )}

     {/*<div className="fixed right-6 bottom-6">
        <motion.button
          onClick={isAtBottom ? scrollToTop : scrollToBottom}
          className="p-4 bg-blue-500 text-white shadow-lg rounded-full hover:bg-blue-600 transition-all duration-300"
          whileHover={{ scale: 1.1, boxShadow: "0px 4px 12px rgba(0,0,0,0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          {isAtBottom ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
        </motion.button>
      </div>*/}

      <div ref={containerRef} className="h-full overflow-y-auto px-4 py-6 scroll-smooth">
        {Object.keys(conversations).length > 0 ? (
          <motion.div
            key={currentBranchIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {currentConversation.length > 0 ? (
              currentConversation.map((message, index) => (
                <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                  {message.userMessage && (
                    <Message message={message.userMessage} role={authData.user?.charAt(0)} currentBranchIndex={currentBranchIndex} conversations={conversations} />
                  )}
                  {message.aiMessage ? (
                    <Message message={message.aiMessage} onRegenerate={message.userMessage} role="assistant" />
                  ) : isProcessing ? (
                    <Loader />
                  ) : null}
                  {index === currentConversation.length - 1 && <div ref={lastMessageRef} />}
                </motion.div>
              ))
            ) : null}
            <Suspense fallback={<Loader />}>
              <Footer isProcessing={isProcessing} currentModel={currentModel} setCurrentModel={setCurrentModel} />
            </Suspense>
          </motion.div>
        ) : (
          <HomeUI />
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
