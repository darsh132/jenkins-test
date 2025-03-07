import { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { motion } from "framer-motion";
import { ClipboardCopy, X, Code } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useArtifact } from "../context/ArtifactContext";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { xml } from "@codemirror/lang-xml";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { php } from "@codemirror/lang-php";
import { csharp } from "@replit/codemirror-lang-csharp"; 

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  java: java(),
  c: cpp(),
  cpp: cpp(),
  xml: xml(),
  rust: rust(),
  go: go(),
  php: php(),
  csharp: csharp(),
};

const ArtifactViewer = ({ selectedArtifact, setSelectedArtifact }) => {
  const [streamedContent, setStreamedContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedArtifact?.content) {
      setStreamedContent("");
      let index = 0;
      const contentLength = selectedArtifact.content.length;

      const interval = setInterval(() => {
        setStreamedContent((prev) => prev + selectedArtifact.content[index]);
        index++;
        if (index >= contentLength) clearInterval(interval);
      }, 10);

      return () => clearInterval(interval);
    }
  }, [selectedArtifact]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedArtifact?.content || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const detectedLanguage = selectedArtifact?.language?.toLowerCase() || "plaintext";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col p-4 bg-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => setSelectedArtifact(null)}
          className="p-2 text-gray-400 hover:text-blue-400 transition-all flex items-center"
        >
          <X size={22} className="mr-1" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <span className="text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-lg uppercase">
          {selectedArtifact.language || "Unknown"}
        </span>
        <motion.button
          whileHover={{ scale: 1.2, color: "#4CAF50" }}
          whileTap={{ scale: 0.9 }}
          className="text-gray-400 hover:text-gray-200 transition"
          onClick={handleCopy}
        >
          <ClipboardCopy size={18} />
        </motion.button>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={streamedContent || "// No content available"}
          extensions={[languageExtensions[detectedLanguage] || javascript()]}
          theme={dracula}
          options={{ readOnly: true, lineNumbers: true }}
          className="w-full h-full border border-gray-600 rounded-md text-sm"
        />
      </div>

      {/* Copy Notification */}
      {copied && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-green-400 text-sm mt-2 text-center"
        >
          ✅ Copied to clipboard!
        </motion.p>
      )}
    </motion.div>
  );
};

const ArtifactsList = ({ artifact, setSelectedArtifact, selectedArtifact }) => {
  return (
    <div className="h-full text-white shadow-2xl overflow-auto border-l border-gray-700 p-6 bg-black backdrop-blur-lg z-50">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-gray-200">🧩 Artifacts</h2>
      </div>
      <div className="space-y-4">
        {artifact.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gray-800 p-4 rounded-lg shadow-md transition-all flex items-center justify-between cursor-pointer ${
              selectedArtifact?.id === item.id ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => setSelectedArtifact(item)}
          >
            <span className="text-white font-medium">{item.language}</span>
            <Code size={18} className="text-blue-400" />
          </motion.div>
        ))}
      </div>
      {selectedArtifact && (
        <ArtifactViewer selectedArtifact={selectedArtifact} setSelectedArtifact={setSelectedArtifact} />
      )}
    </div>
  );
};

const ArtifactsContainer = () => {
  const { isArtifactOpen } = useChat();
  const { selectedArtifact, setSelectedArtifact, artifact } = useArtifact();

  useEffect(() => {
    console.log("Selected Artifact in Viewer:", selectedArtifact);
  }, [selectedArtifact]);

  useEffect(() => {
    console.log("artifact:", artifact);
  }, [artifact]);


  useEffect(() => {
    console.log("Selected Artifact in List:", selectedArtifact);
  }, [selectedArtifact]);
  
  
  if (!isArtifactOpen) return null;

  return selectedArtifact ? (
    <ArtifactViewer selectedArtifact={selectedArtifact} setSelectedArtifact={setSelectedArtifact} />
  ) : (
    <ArtifactsList artifact={artifact} setSelectedArtifact={setSelectedArtifact} selectedArtifact={selectedArtifact} />
  );
};

export default ArtifactsContainer;
