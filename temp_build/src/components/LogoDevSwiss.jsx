export default function LogoDevSwiss({ className = "", showText = true }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showText ? "0 0 160 100" : "0 0 160 60"}
      className={`w-20 h-auto ${className}`}
      fill="currentColor"
    >
      {/* Beautiful Modern Tech Logo */}
      <g id="beautiful-modern-tech">
        {/* Central diamond hub */}
        <path d="M 80 20 L 90 30 L 80 40 L 70 30 Z" fill="currentColor" />
        <path d="M 80 22 L 88 30 L 80 38 L 72 30 Z" fill="currentColor" opacity="0.8" />
        <path d="M 80 24 L 86 30 L 80 36 L 74 30 Z" fill="currentColor" opacity="0.6" />
        
        {/* Elegant curved connections */}
        <path d="M 90 30 Q 100 30 105 25 Q 110 20 115 25" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M 70 30 Q 60 30 55 25 Q 50 20 45 25" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M 80 40 Q 80 50 75 55 Q 70 60 65 55" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M 80 40 Q 80 50 85 55 Q 90 60 95 55" stroke="currentColor" strokeWidth="2.5" fill="none" />
        
        {/* Beautiful terminal nodes */}
        <circle cx="115" cy="25" r="5" fill="currentColor" />
        <circle cx="115" cy="25" r="3" fill="currentColor" opacity="0.8" />
        <circle cx="115" cy="25" r="1.5" fill="currentColor" opacity="0.6" />
        
        <circle cx="45" cy="25" r="5" fill="currentColor" />
        <circle cx="45" cy="25" r="3" fill="currentColor" opacity="0.8" />
        <circle cx="45" cy="25" r="1.5" fill="currentColor" opacity="0.6" />
        
        <circle cx="65" cy="55" r="5" fill="currentColor" />
        <circle cx="65" cy="55" r="3" fill="currentColor" opacity="0.8" />
        <circle cx="65" cy="55" r="1.5" fill="currentColor" opacity="0.6" />
        
        <circle cx="95" cy="55" r="5" fill="currentColor" />
        <circle cx="95" cy="55" r="3" fill="currentColor" opacity="0.8" />
        <circle cx="95" cy="55" r="1.5" fill="currentColor" opacity="0.6" />
        
        {/* Delicate connecting lines */}
        <path d="M 115 25 Q 113 27 111 29" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M 45 25 Q 47 27 49 29" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M 65 55 Q 67 53 69 51" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M 95 55 Q 93 53 91 51" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
        
        {/* Sparkling accent points */}
        <circle cx="80" cy="18" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="80" cy="42" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="75" cy="30" r="0.8" fill="currentColor" opacity="0.6" />
        <circle cx="85" cy="30" r="0.8" fill="currentColor" opacity="0.6" />
        
        {/* Elegant rings around nodes */}
        <circle cx="115" cy="25" r="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <circle cx="45" cy="25" r="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <circle cx="65" cy="55" r="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <circle cx="95" cy="55" r="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </g>
      
      {/* Elegant Dev-Swiss Text - seulement si showText est true */}
      {showText && (
        <text
          x="80"
          y="85"
          textAnchor="middle"
          fill="currentColor"
          fontSize="24"
          fontWeight="900"
          fontFamily="Arial, sans-serif"
          letterSpacing="1.8"
        >
          Dev-Swiss
        </text>
      )}
    </svg>
  );
}
