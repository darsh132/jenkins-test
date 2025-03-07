import React, { useState, useEffect } from "react";
import { get_encoding } from "@dqbd/tiktoken";

const TokenCounter = () => {
  const [text, setText] = useState("");
  const [tokenCount, setTokenCount] = useState(0);
  const encoder = get_encoding("cl100k_base"); // Use encoding for OpenAI models like GPT-4, GPT-3.5

  useEffect(() => {
    const tokens = encoder.encode(text);
    setTokenCount(tokens.length);
  }, [text]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Real-Time Token Counter</h1>
      <textarea
        className="w-full max-w-2xl p-2 border rounded-md"
        rows="5"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <p className="mt-2 text-lg">
        <strong>Token Count:</strong> {tokenCount}
      </p>
    </div>
  );
};

export default TokenCounter;
