import { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { encode } from "gpt-tokenizer";
import { motion } from "framer-motion";

function StartChat() {
  const [message, setMessage] = useState("");
  const [hideSuggestions, setHideSuggestions] = useState(false);
  const [height, setHeight] = useState("56px");
  const [tokenCount, setTokenCount] = useState(0);
  const { onSendMessage, currentBranchIndex, isProcessing } = useChat();

  useEffect(() => {
    setTokenCount(encode(message).length);
    adjustHeight();
  }, [message]);

  const adjustHeight = () => {
    const textarea = document.getElementById("message-input");
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200);
      setHeight(`${newHeight}px`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message, currentBranchIndex);
      setMessage("");
      setHeight("56px");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setTimeout(() => {
      onSendMessage(suggestion, currentBranchIndex);
      setMessage("");
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto p-4"
    >
      {/* Chat Input Container */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative bg-[#d6d7ff] bg-opacity-30 backdrop-blur-lg border border-blue-100 shadow-2xl rounded-xl p-5"
      >
        <textarea
          id="message-input"
          value={message}
          placeholder="Ask me anything..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ height }}
          className="w-full resize-none bg-transparent text-lg text-black placeholder-gray-400 caret-white outline-none p-2"
        ></textarea>

        {/* Typing Indicator when Processing */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            className="absolute left-5 bottom-5 text-gray-600 text-sm"
          >
            Typing...
          </motion.div>
        )}

        {/* Send Button with Animation */}
        <motion.button
          type="submit"
          disabled={!message.trim() || isProcessing}
          whileTap={{ scale: 0.9 }}
          className={`absolute bottom-4 right-4 flex items-center justify-center p-3 rounded-full shadow-md transition-all transform ${
            message.trim() && !isProcessing
              ? "bg-orange-500 text-black hover:bg-orange-600"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          {isProcessing ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 size={20} className="animate-spin" />
            </motion.div>
          ) : (
            <Send size={20} />
          )}
        </motion.button>
      </motion.form>

      {/* Suggestions Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`transition-all duration-500 ease-in-out mt-4 rounded-xl border border-blue-100 bg-[#d6d7ff] bg-opacity-30 backdrop-blur-lg p-4 shadow-lg ${
          hideSuggestions ? "max-h-14 overflow-hidden opacity-50" : "max-h-96 opacity-100"
        }`}
      >
        <div className="flex justify-between items-center">
          <button
            onClick={() => setHideSuggestions(!hideSuggestions)}
            className="text-sm text-black font-medium transition-all hover:text-black"
          >
            {hideSuggestions ? "Show suggestions" : "Get started with an example"}
          </button>
        </div>

        {!hideSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {["Generate a step-by-step guide on improving workplace productivity.", "Create an Excel formula to automate daily reporting tasks.", "Write a concise blog on the latest trends in cyber security"].map((text, index) => (
              <motion.button
                key={index}
                onClick={() => handleSuggestionClick(text)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg text-sm text-black bg-white/20 hover:bg-blue-200 transition shadow-md"
              >
                {text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default StartChat;
