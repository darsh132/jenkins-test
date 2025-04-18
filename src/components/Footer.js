import { useState, useEffect } from "react";
import { useArtifact } from "../context/ArtifactContext";
import { encode } from "gpt-tokenizer";
import { useChat } from "../context/ChatContext";
import { 
  Send, 
  Loader2, 
  RefreshCw, 
  X, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Share,
  Download,
  Copy,
  FileText,
  MoreHorizontal,
  Sparkles,
  Brain,
  AlertCircle,
  Zap,
  PenTool,
  Settings,
  Maximize2,
  HelpCircle,
  Info
} from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const [message, setMessage] = useState("");
  const [height, setHeight] = useState("48px");
  const [tokenCount, setTokenCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
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

  const toggleThinking = () => {
    setIsThinking(!isThinking);
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
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
          className="bg-white z-40 border-blue-200 shadow-lg border rounded-xl p-2 w-full"
        >
          {/* Input Field */}
          <div className="flex items-center space-x-2 p-2 border-b border-gray-100">
            <textarea
              id="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
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
            <div className="flex space-x-1">
              <button className="p-2 text-blue-600 hover:text-blue-800 transition hover:bg-blue-50 rounded-md tooltip" title="Analytical Mode">
                <Brain size={18} />
              </button>
              <button className="p-2 text-blue-600 hover:text-blue-800 transition hover:bg-blue-50 rounded-md tooltip" title="Creative Mode">
                <Sparkles size={18} />
              </button>
              <button 
                className={`p-2 transition rounded-md tooltip ${isThinking ? 'bg-blue-100 text-blue-800' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'}`}
                onClick={toggleThinking}
                title="Deep Analysis"
              >
                <Zap size={18} />
              </button>
              <button className="p-2 text-blue-600 hover:text-blue-800 transition hover:bg-blue-50 rounded-md tooltip" title="Document Analysis">
                <FileText size={18} />
              </button>
              <button 
                className={`p-2 transition rounded-md tooltip ${showAdvancedOptions ? 'bg-blue-100 text-blue-800' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'}`}
                onClick={toggleAdvancedOptions}
                title="Advanced Options"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="flex space-x-2 items-center">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{tokenCount} tokens</span>
              <div className="flex items-center px-3 py-1 bg-blue-50 rounded-md text-blue-700 text-xs font-medium border border-blue-100">
                <span>{currentModel}</span>
                <button
                  type="button"
                  onClick={toggleModel}
                  className="ml-2 p-1 text-blue-600 hover:text-blue-800 transition rounded-full"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
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
          
          {/* Advanced Options Panel */}
          {showAdvancedOptions && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center justify-center p-2 hover:bg-blue-50 rounded-md cursor-pointer transition">
                  <PenTool size={20} className="text-blue-600 mb-1" />
                  <span className="text-xs text-gray-700">Edit</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 hover:bg-blue-50 rounded-md cursor-pointer transition">
                  <Download size={20} className="text-blue-600 mb-1" />
                  <span className="text-xs text-gray-700">Export</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 hover:bg-blue-50 rounded-md cursor-pointer transition">
                  <Copy size={20} className="text-blue-600 mb-1" />
                  <span className="text-xs text-gray-700">Copy</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 hover:bg-blue-50 rounded-md cursor-pointer transition">
                  <Settings size={20} className="text-blue-600 mb-1" />
                  <span className="text-xs text-gray-700">Settings</span>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Thinking Mode Panel */}
          {isThinking && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
            >
              <div className="flex items-start">
                <div className="mr-2 mt-1">
                  <Info size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Deep Analysis Mode</p>
                  <p className="text-xs text-gray-600">AI will perform extended reasoning on complex problems before responding. Best for analytical tasks, research questions, and technical problems.</p>
                </div>
              </div>
            </motion.div>
          )}
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
  
  .tooltip {
    position: relative;
  }
  
  .tooltip:hover:after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0,0,0,0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 100;
    margin-bottom: 5px;
  }
  `}
</style>
    </div>
  );
};

export default Footer;