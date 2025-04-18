import { Link } from "react-router-dom";

function ChatCard({ chat, isCollapsed, delay }) {
  const delay_css = isCollapsed ? "0ms" : `${delay}ms`;
  return (
    <Link
      to={`/c/${chat.sessionId}`} // Using sessionId dynamically
      className={`${isCollapsed ? "scale-90 pointer-events-none" : "opacity-100 scale-100"} cursor-pointer border-2 border-blue-100 bg-[#DFE4F7] rounded-xl p-3 opacity-0 transition-all duration-300 hover:border-borderclr hover:bg-bg2`}
      style={{
        transition: `opacity 250ms ${delay_css}, transform 250ms ${delay_css}, color 150ms 0ms, background-color 150ms 0ms, border-color 150ms 0ms`,
      }}
    >
      <i className="nf nf-md-chat_outline md:block text-sm text-text2">
        &nbsp;
      </i>
      <span className="text-md py-2 text-text1">{chat.message}</span>
    </Link>
  );
}

export default ChatCard;
