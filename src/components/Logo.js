import React from "react"

export function Logo({ isExpanded }) {
  return (
    
    <div className="relative h-16 w-full overflow-hidden">
        <img src="https://escanav.com/en/images/escan4.png" className="h-14"></img>
      <div
        className={`absolute left-0 top-0 flex h-full w-full items-center justify-center transition-transform duration-300 ${
          isExpanded ? "-translate-x-16" : "translate-x-0"
        }`}
      >
        
      </div>
      <div
        className={`absolute left-0 top-0 flex h-full w-full items-center justify-start pl-4 transition-opacity duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
      </div>
    </div>
  )
}

