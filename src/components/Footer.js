import { useState, useEffect } from "react";
import { useArtifact } from "../context/ArtifactContext";
import { encode } from "gpt-tokenizer";
import { useChat } from "../context/ChatContext";
import { Send, Loader2, ChevronDown, RefreshCw, Smile, Paperclip, Mic, X, Image, FileText, Settings } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const [message, setMessage] = useState("");
  const [height, setHeight] = useState("48px");
  const [tokenCount, setTokenCount] = useState(0);
  const {
    conversations,
    currentBranchIndex,
    currentModel,
    setCurrentModel,
    onSendMessage,
    isProcessing,
    isArtifactOpen,
    setIsArtifactOpen,
  } = useChat();

  const models = ["gpt", "gemini", "mistral", "claude"];
  const toggleModel = () => {
    const currentIndex = models.indexOf(currentModel);
    setCurrentModel(models[(currentIndex + 1) % models.length]);
  };

  const adjustHeight = () => {
    const textarea = document.getElementById("message-input");
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 150);
      setHeight(`${newHeight}px`);
    }
  };

  useEffect(() => {
    setTokenCount(encode(message).length);
    adjustHeight();
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, currentBranchIndex);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative w-full flex flex-col hidden-for-5s">
      <div className="fixed bottom-4 w-1/2 ml-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-lg border border-gray-300 rounded-xl p-2 backdrop-blur-lg w-full"
        >
          {/* Input Field */}
          <div className="flex items-center space-x-2 p-2 border-b border-gray-200">
            <textarea
              id="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={{ height }}
              className="w-full text-gray-800 text-sm bg-transparent px-3 py-2 focus:outline-none resize-none placeholder-gray-500 border-none"
            />
            {message && (
              <button onClick={() => setMessage("")} className="p-2 text-gray-600 hover:text-gray-800 transition hover:bg-gray-100 rounded-md">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Icons Group */}
          <div className="flex items-center justify-between p-2">
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-800 transition hover:bg-gray-100 rounded-md">
                {/*<Paperclip size={18} />*/}
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 transition hover:bg-gray-100 rounded-md">
                {/*<Mic size={18} />*/}
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 transition hover:bg-gray-100 rounded-md">
                {/*<Image size={18} />*/}
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 transition hover:bg-gray-100 rounded-md">
                {/*<FileText size={18} />*/}
              </button>
            </div>
            <div className="flex space-x-2 items-center">
            <span className="text-sm text-gray-600"> {tokenCount} tokens</span>
             
              <span className="text-sm text-gray-600">{currentModel}</span>
              <button
                type="button"
                onClick={toggleModel}
                className="p-2 text-gray-600 hover:text-gray-800 transition hover:bg-gray-100 rounded-md"
              >
                <RefreshCw size={18} />
              </button>
              <button
                type="submit"
                disabled={!message.trim() || isProcessing}
                onClick={handleSubmit}
                className={`p-2 rounded-md transition ${
                  message.trim() && !isProcessing ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400"
                }`}
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      <style>
  {`
   @keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.hidden-for-5s {
  opacity: 0;
  animation: fadeIn 1s ease-in-out 5s forwards;
}

  `}
</style>
    </div>
  );
};

export default Footer;