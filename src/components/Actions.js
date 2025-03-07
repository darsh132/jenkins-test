import React, { useState, useEffect } from 'react';
import { Clipboard, CheckCircle2, ThumbsUp, ThumbsDown, RotateCcw, PencilLine, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useArtifact } from "../context/ArtifactContext";
import { useChat } from "../context/ChatContext";
import TypingEffect from './TypingEffect';


const CodeBlock = ({ children, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(children)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.error("Failed to copy:", err));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = children;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback: Copying failed", err);
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="relative my-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header with Language Label and Copy Button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs text-gray-600 uppercase">{language || "Code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-2 py-1 text-gray-600 hover:bg-gray-200 rounded transition"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Clipboard size={14} />}
          <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Code Block */}
      <pre className="p-4 text-sm font-mono bg-gray-900 text-white rounded-b-lg overflow-x-auto">
        <code className={`language-${language || 'text'}`}>{children}</code>
      </pre>
    </div>
  );
};

const MessageActions = ({ content, onRegenerate, onFeedback, role, isEditing, setIsEditing, editedContent, setEditedContent }) => { 
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);
  const { conversations, currentBranchIndex, setCurrentBranchIndex, onSendMessage } = useChat();

  const handleRegenerate = () => {
    const existingKeys = Object.keys(conversations)
      .map(key => parseInt(key.replace("conversation ", ""), 10))
      .filter(num => !isNaN(num));

    const newIndex = existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 0;

    setCurrentBranchIndex(newIndex);
    console.log(`Setting lock: ${JSON.stringify(conversations)}`);
    onSendMessage(onRegenerate, newIndex);
    setIsEditing(false);
  };

  const handleCopy = () => {
    if (content) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => console.error("Failed to copy:", err));
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = content;
        textarea.style.position = "fixed"; 
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Fallback: Copying failed", err);
        }
        document.body.removeChild(textarea);
      }
    } else {
      console.error('Content is not available for copy.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    onFeedback?.(type);
  };

  return (
    <div className="grid max-w-[180px] bg-white rounded-md p-2 justify-items-end mr-6 gap-2">
      <>
        {role === 'assistant' && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 rounded hover:bg-blue-100 transition-colors"
              title={copied ? "Copied!" : "Copy code"}
            >
              {copied ? <CheckCircle2 size={14} /> : <Clipboard size={14} />}
              <span className="text-xs text-gray-500 hover:text-gray-700">{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              title="Regenerate response"
            >
              <RotateCcw size={14} />
              <span>Retry</span>
            </button>

            <button
              onClick={() => handleFeedback('up')}
              className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${feedback === 'up' ? 'text-green-600' : 'text-gray-400'}`}
              title="Thumbs up"
            >
              <ThumbsUp size={14} />
            </button>
            <button
              onClick={() => handleFeedback('down')}
              className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${feedback === 'down' ? 'text-red-600' : 'text-gray-400'}`}
              title="Thumbs down"
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        )}
        {role !== 'assistant' && (
  <button
    className="flex items-center space-x-1 rounded hover:bg-gray-100 transition-colors px-1 py-0.5 text-[10px]" // Adjusted padding and font size
    title="Edit"
    onClick={handleEdit}
  >
    <PencilLine size={10} /> {/* Further reduced icon size */}
    <span>Edit</span>
  </button>
)}

      </>
    </div>
  );
};

// Avatar Component
const Avatar = ({ role }) => (
  <div className="w-6 h-6 rounded-full flex-shrink-0 bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
    {role === 'assistant' ? 'AI' : role }
  </div>
);

const Message = ({
  message,
  onRegenerate,
  onFeedback,
  className = '',
  role
}) => {
  const isAssistant = role === 'assistant';
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message);
  const [artifactsState, setArtifactsState] = useState([]);
  const { artifact, setArtifact, selectedArtifact, setSelectedArtifact } = useArtifact();
  const { conversations, currentBranchIndex, setCurrentBranchIndex, onSendMessage, isArtifactOpen, setIsArtifactOpen } = useChat(); // ✅ Correct Destructuring

  console.log('message received :', message);

  useEffect(() => {
    if (artifactsState.length > 0) {
      setArtifact(artifactsState);
      setSelectedArtifact(artifactsState[0]);
      setIsArtifactOpen(true);
    }
  }, [artifactsState, setArtifact]);

  const handleCancel = () => setIsEditing(false);

  const handleSave = () => {
    // Get the highest conversation index and increment it
    const existingKeys = Object.keys(conversations)
      .map(key => parseInt(key.replace("conversation ", ""), 10))
      .filter(num => !isNaN(num));
  
    const newIndex = existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 0;

    setCurrentBranchIndex(newIndex);
  
    console.log(`Setting lock: ${JSON.stringify(conversations)}`);
    onSendMessage(editedContent, newIndex);
    setIsEditing(false);
  };
  

  const transformMessageContent = content => {
    const lines = content.split('\n');
    let html = '';
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent = '';

    lines.forEach((line) => {
      line = line.trim();

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          html += `<div class="code-block" data-language="${codeLanguage}">${codeContent}</div>`;
          codeContent = '';
          codeLanguage = '';
          inCodeBlock = false;
        } else {
          const match = line.match(/```(\w+)?/);
          codeLanguage = match && match[1] ? match[1] : 'plaintext';
          inCodeBlock = true;
        }
      } else if (inCodeBlock) {
        codeContent += `${line}\n`;
      } else {
        line = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Bold text

        if (line === '') {
          html += '<br>';
        } else if (line.startsWith('### ')) {
          html += `<h3>${line.substring(4)}</h3>`;
        } else if (line.startsWith('## ')) {
          html += `<h2>${line.substring(3)}</h2>`;
        } else if (line.startsWith('# ')) {
          html += `<h1>${line.substring(2)}</h1>`;
        } else if (line.startsWith('- ')) {
          html += `<ul><li>${line.substring(2)}</li></ul>`;
        } else if (/^\d+\.\s/.test(line)) {
          html += `<ol><li>${line.substring(line.indexOf(' ') + 1)}</li></ol>`;
        } else {
          html += `<p>${line}</p>`;
        }
      }
    });

    if (inCodeBlock) {
      html += `<div class="code-block" data-language="${codeLanguage}">${codeContent}</div>`;
    }

    return html;
  };

  let transformedContent;
  if (message !== '' && message !== undefined) 
  {
    transformedContent = transformMessageContent(message);
  }

  const renderContent = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    let newArtifacts = [];
  
    const elements = Array.from(doc.body.childNodes).map((node, index) => {
      if (node.nodeName === "DIV" && node.classList.contains("code-block")) {
        const lines = node.textContent.split("\n").length;
        if (lines > 4) {
          const artifactId = `artifact-${newArtifacts.length}`;
          newArtifacts.push({
            id: artifactId,
            language: node.dataset.language,
            content: node.textContent,
          });
          return (
            <div className="bg-gray-900 p-3 max-w-sm rounded-lg shadow-md border border-gray-700 hover:shadow-neon transition-all duration-300 ease-in-out">
  <button
    key={index}
    className="flex items-center gap-3 text-gray-300 hover:text-green-500 transition-colors duration-200 ease-in-out w-full text-left"
    onClick={() =>
      setArtifactsState([
        {
          id: artifactId,
          language: node.dataset.language,
          content: node.textContent,
        },
      ])
    }
  >
    <div className="flex items-center justify-center w-8 h-8 bg-gray-800 text-green-500 rounded-md shadow-md border border-green-500">
      <Code className="w-5 h-5" />
    </div>
    <span className="text-base font-medium tracking-wide">
      Code for <span className="text-green-500">{node.dataset.language}</span>
    </span>
  </button>
</div>


          
          
          );
        }
        return (
          <CodeBlock key={index} language={node.dataset.language}>
            {node.textContent}
          </CodeBlock>
        );
      }
      return <div key={index} dangerouslySetInnerHTML={{ __html: node.outerHTML }} />;
    });
  
    return elements;
  };

  return (
    <>
      <div className={`flex items-start gap-4 p-4 border-2 border-blue-100 ${isAssistant ? 'bg-[#DFE4F7]' : 'bg-[#A9C3FE]'} rounded-xl m-4 mb-0 animate-fade-in ${className}`}>
        <Avatar role={role} />
        <div className="flex-1 min-w-0 overflow-hidden">
          {isEditing ? (
            <div>
              <label className="text-sm text-gray-600">
                Editing this message will create a new conversation branch. You can switch between branches using the arrow navigation buttons.
              </label>
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Prevent newline in textarea
                    handleSave(); // Call handleSave on Enter
                  }
                }}
                className="border rounded p-1 w-full mt-1"
              />
              <div className="flex justify-between mt-2">
                <button onClick={handleCancel} className="text-red-500">Cancel</button>
                <button onClick={handleSave} className="text-blue-500">Save</button>
              </div>
            </div>
          ) : (
            isAssistant ? (
              <>
                <TypingEffect elements={renderContent(transformedContent)} />
              </>
            ) : (
              renderContent(transformedContent)
            )
          )}
        </div>
      </div>
      <div className="flex justify-end">
  <MessageActions 
    content={message}  // Pass function reference
    onRegenerate={onRegenerate}
    onFeedback={onFeedback} 
    role={role} 
    isEditing={isEditing} 
    setIsEditing={setIsEditing} 
    editedContent={editedContent} 
    setEditedContent={setEditedContent} 
  />

      </div>
    </>
  );
}; 

// Loading Message Component
const LoadingMessage = () => (
  <div className="flex items-start gap-4">
    
    <Avatar role="assistant" />
    <div className="flex items-center gap-1 pt-2">
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
    </div>
  </div>
);

export { Message, LoadingMessage, CodeBlock, MessageActions, Avatar };
