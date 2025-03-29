import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, CheckCircleIcon } from "lucide-react";

const timelineData = [
  { date: "2024-03-01", title: "Project Kickoff", description: "Initial project planning and discussion.", status: "completed" },
  { date: "2024-03-10", title: "Design Phase", description: "UI/UX design finalized.", status: "completed" },
  { date: "2024-03-20", title: "Development Started", description: "Core features implementation begins.", status: "ongoing" },
  { date: "2024-04-01", title: "Testing Phase", description: "QA testing and bug fixes.", status: "pending" },
  { date: "2024-04-10", title: "Launch", description: "Final deployment and release.", status: "pending" }
];

function Time() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (timelineRef.current) {
      const activeElement = timelineRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeIndex]);

  return (
    <div className="max-w-5xl mx-auto p-6 flex space-x-6">
      {/* Left side timeline */}
      <div ref={timelineRef} className="relative flex flex-col w-1/3 overflow-auto h-96 pr-4">
        <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-300 dark:bg-gray-700"></div>
        {timelineData.map((event, index) => (
          <motion.div
            key={index}
            className={`relative mb-12 pl-6 cursor-pointer transition-all ${
              index === activeIndex ? "scale-110 font-bold" : "opacity-70"
            }`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => setActiveIndex(index)}
          >
            <span
              className={`absolute left-[-10px] top-2 h-6 w-6 flex items-center justify-center rounded-full transition-transform ${
                event.status === "completed"
                  ? "bg-green-500"
                  : event.status === "ongoing"
                  ? "bg-blue-500"
                  : "bg-gray-400"
              } ${index === activeIndex ? "scale-125 ring-4 ring-offset-2 ring-gray-600" : ""}`}
            >
              {event.status === "completed" ? (
                <CheckCircleIcon className="text-white w-5 h-5" />
              ) : (
                <CalendarIcon className="text-white w-5 h-5" />
              )}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{event.date}</p>
            <h3 className="text-lg font-semibold mt-1">{event.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* Right side single large card */}
      <div className="w-2/3 h-96 flex items-center justify-center">
        <motion.div
          key={activeIndex}
          className="p-6 shadow-lg bg-white dark:bg-gray-900 border rounded-lg w-full max-w-lg transition-all"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{timelineData[activeIndex].date}</p>
          <h3 className="text-xl font-semibold mt-2">{timelineData[activeIndex].title}</h3>
          <p className="text-gray-700 dark:text-gray-300 mt-2">{timelineData[activeIndex].description}</p>
        </motion.div>
      </div>
    </div>
  );
}

export default Time;
