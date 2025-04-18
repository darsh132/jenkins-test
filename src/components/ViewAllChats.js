import { useChat } from "../context/ChatContext.js";
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar.js";
import { 
  ChevronLeft, 
  MessageSquare, 
  Menu, 
  Search,
  ChevronRight,
  Archive,
  Filter,
  X
} from "lucide-react";
import ChatCard from "./chatcard.js";

function ViewAllChats() {
  const { promptHistory, topmessage } = useChat();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [collapseChats, setCollapseChats] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest");
  const mainContentRef = useRef(null);
  
  // Pagination settings
  const itemsPerPage = 5;
  
  // Filter and sort chats
  const filteredChats = promptHistory
    .filter(chat => chat.message.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
    });

  const totalPages = Math.ceil(filteredChats.length / itemsPerPage);

  // Get current page items
  const currentChats = filteredChats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    document.body.classList.add("bg-slate-50", "min-h-screen");
    
    // Close sidebar on mobile when component mounts
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarPinned(false);
        setIsSidebarOpen(false);
      } else if (window.innerWidth >= 1280) {
        setIsSidebarPinned(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove("bg-slate-50", "min-h-screen");
    };
  }, []);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  const handleSidebarToggle = (pinned) => {
    setIsSidebarPinned(pinned);
  };

  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    let startRange = Math.max(2, currentPage - Math.floor((maxVisiblePages - 2) / 2));
    let endRange = Math.min(totalPages - 1, startRange + maxVisiblePages - 3);
    
    // Adjust startRange if endRange is at maximum
    if (endRange === totalPages - 1) {
      startRange = Math.max(2, endRange - (maxVisiblePages - 3));
    }
    
    // Add ellipsis after first page if needed
    if (startRange > 2) {
      pages.push('ellipsis-start');
    }
    
    // Add range pages
    for (let i = startRange; i <= endRange; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endRange < totalPages - 1) {
      pages.push('ellipsis-end');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="h-screen w-full flex flex-col font-serif text-gray-800 overflow-hidden">
      {/* Header - Fixed */}
        <div className="fixed bg-[#A9C3FE]/30 backdrop-blur-md border-b border-white/20 shadow-md w-full z-10 flex items-center px-6 py-3">
              <button className="md:hidden flex items-center text-gray-700 hover:text-gray-900 transition-all">
                <Menu size={24} />
              </button>
              <motion.img
                src="https://escanav.com/en/images/escan7.png"
                alt="Logo"
                className="h-12 md:h-14 transition-transform duration-300 hover:scale-105"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              {topmessage && (
                <div className="relative bg-[#e0e7ff] text-blue-500 text-sm md:text-base font-medium px-4 py-2 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg">
                  {topmessage}
                </div>
              )}
            </div>

      <Sidebar onSidebarToggle={setIsSidebarPinned} />
      {/* Main layout with sidebar and content */}
      <div className={`flex flex-grow pt-20 pb-16 overflow-hidden ${isSidebarPinned ? "ml-60" : "ml-6"}`}>
       
    
      
        {/* Main Content - Scrollable */}
        <div 
          className="flex-grow overflow-y-auto transition-all duration-300 px-3 sm:px-4 md:px-6">
          {/* Page Title Bar - Sticky */}
          <motion.div 
            initial={{ y: -10, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.4 }} 
            className="fixed relative mt-12 w-full mb-12 z-10 bg-white/30 backdrop-blur-md  sm:px-5 py-3 sm:py-4 gap-3 rounded-lg shadow-sm sm:mb-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h1 className="text-base sm:text-lg font-semibold text-blue-800">Chat History</h1>
              </div>
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-white/30 text-blue-700 rounded-md transition-all border border-blue-100 hover:bg-blue-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="ml-1 text-xs sm:text-sm hidden sm:inline">Back</span>
              </button>
            </div>
            
            {/* Search and filter bar */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-between">
              <div className="relative w-full flex-grow">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md border border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
                <select 
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md border border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Chat List */}
          <motion.div
            className="w-full mt-4 max-w-4xl flex flex-col gap-3 pb-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            <AnimatePresence>
              {currentChats.length > 0 ? (
                currentChats.map((chat, index) => (
                  <ChatCard
                    key={chat.sessionId || index}
                    chat={{ 
                      ...chat, 
                      message: chat.message.length > 60 ? chat.message.slice(0, 60) + "..." : chat.message 
                    }}
                    isCollapsed={collapseChats}
                    delay={index * 40}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mt-6 py-10 px-4 sm:py-12 sm:px-6 rounded-lg border border-slate-200 bg-white"
                >
                  <Archive className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-slate-700 font-medium mb-2">No conversations found</p>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    {searchTerm ? "Try adjusting your search criteria" : "Start a new conversation to see it here"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Pagination - Fixed at bottom */}
      {filteredChats.length > itemsPerPage && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-2 sm:py-3 px-2 sm:px-4 flex justify-center items-center z-10">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1.5 sm:p-2 rounded-md ${
                currentPage === 1 
                  ? "text-slate-400 cursor-not-allowed" 
                  : "text-blue-600 hover:bg-blue-50"
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {getPaginationNumbers().map((page, index) => (
                page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                  <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-slate-400">...</span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(page)}
                    className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm ${
                      currentPage === page
                        ? "bg-blue-600 text-white font-medium"
                        : "text-slate-600 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-1.5 sm:p-2 rounded-md ${
                currentPage === totalPages || totalPages === 0
                  ? "text-slate-400 cursor-not-allowed" 
                  : "text-blue-600 hover:bg-blue-50"
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewAllChats;