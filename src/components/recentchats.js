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
      <div className="flex justify-between">
        <div className="flex">
          <p className="text-sm font-bold text-text1">
            <i className="nf nf-md-chat_outline text-btext"></i> &nbsp; Your
            recent chats &nbsp;
          </p>
          <Button
            value={
              <>
                <i
                  className={`nf nf-fa-chevron_up ${collapseChats ? "rotate-180 -top-0.5" : ""} relative inline-block text-xs transition-all duration-300`}
                ></i>
                <span className="text-sm text-text2">
                  {collapseChats && "\u00A0 Show"}
                </span>
              </>
            }
            extraClass="relative -top-1"
            onClick_function={() => setCollapseChats(!collapseChats)}
          />
        </div>
        <span  onClick={() => navigate("/view-all-chats")} className="cursor-pointer text-sm text-text2 transition-all hover:text-text1 hover:underline hover:transition-all">
          View all <i className="nf nf-cod-arrow_right"></i>
        </span>
      </div>
      <div
        className={`${collapseChats ? "max-h-0" : "max-h-96"} transition-all duration-300 grid md:grid-cols-3 gap-3`}
      >
        {promptHistory.length > 0 ? (
          promptHistory.map((chat, index) => (
            <ChatCard
  key={chat.sessionId}
  chat={{ ...chat, message: chat.message.length > 20 ? chat.message.slice(0, 20) + "..." : chat.message }} 
  isCollapsed={collapseChats}
  delay={index * 50}
/>

          ))
        ) : (
          <p className="text-sm text-text2">No recent chats available.</p>
        )}
      </div>
    </div>
  );
}

export default RecentChats;
