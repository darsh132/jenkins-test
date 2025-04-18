import { useState } from "react";
import Button from "./button.js";
import ChatCard from "./chatcard.js";
import { useChat } from "../context/ChatContext.js";
import { useNavigate } from "react-router-dom";

function RecentChats() {
  const [collapseChats, setCollapseChats] = useState(false);
  const { promptHistory } = useChat();
  const navigate = useNavigate();

  console.log(JSON.stringify(promptHistory));

  return (
    <div className="flex md:w-screen md:max-w-2xl px-5 flex-col">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <span className="text-sm font-medium text-text1 flex items-center">
            <i className="nf nf-md-chat_outline text-btext mr-2"></i>
            Your recent conversations
          </span>
          <Button
            value={
              <span className="flex items-center ml-2">
                <i
                  className={`nf ${collapseChats ? "nf-fa-chevron_down" : "nf-fa-chevron_up"} text-xs transition-all duration-300`}
                ></i>
                <span className="text-sm text-text2 ml-1">
                  {collapseChats ? "Show" : "Hide"}
                </span>
              </span>
            }
            extraClass="ml-2 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
            onClick_function={() => setCollapseChats(!collapseChats)}
          />
        </div>
        <button 
          onClick={() => navigate("/view-all-chats")} 
          className="text-sm text-text2 transition-all hover:text-text1 flex items-center"
        >
          View all conversations
          <i className="nf nf-cod-arrow_right ml-1"></i>
        </button>
      </div>
      
      <div
        className={`${
          collapseChats ? "max-h-0 opacity-0 my-0" : "max-h-96 opacity-100 my-2"
        } overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="grid md:grid-cols-3 gap-4">
          {promptHistory.length > 0 ? (
            promptHistory.map((chat, index) => (
              <ChatCard
                key={chat.sessionId}
                chat={{
                  ...chat,
                  message: chat.message.length > 20 ? chat.message.slice(0, 20) + "..." : chat.message
                }}
                isCollapsed={collapseChats}
                delay={index * 50}
              />
            ))
          ) : (
            <div className="col-span-3 py-6 text-center rounded-lg border border-gray-200">
              <p className="text-sm text-text2">No conversations yet</p>
              <p className="text-xs text-text2 mt-1">Start a new chat to see it here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecentChats;