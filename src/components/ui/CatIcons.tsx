import { cn } from "@/lib/utils";

interface CatIconProps {
  className?: string;
  size?: number;
}

// 🐱 Main cat face icon for logo
export function CatFaceIcon({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {/* Head */}
      <ellipse cx="12" cy="14" rx="9" ry="8" fill="currentColor" opacity="0.2" />
      {/* Left ear */}
      <path
        d="M4 8 L7 13 L3 12 Z"
        fill="currentColor"
        opacity="0.3"
      />
      {/* Right ear */}
      <path
        d="M20 8 L17 13 L21 12 Z"
        fill="currentColor"
        opacity="0.3"
      />
      {/* Inner left ear */}
      <path
        d="M5 9 L6.5 12 L4.5 11.5 Z"
        fill="currentColor"
        opacity="0.6"
      />
      {/* Inner right ear */}
      <path
        d="M19 9 L17.5 12 L19.5 11.5 Z"
        fill="currentColor"
        opacity="0.6"
      />
      {/* Eyes */}
      <ellipse cx="8.5" cy="13" rx="1.5" ry="2" fill="currentColor" />
      <ellipse cx="15.5" cy="13" rx="1.5" ry="2" fill="currentColor" />
      {/* Eye shine */}
      <circle cx="8" cy="12.5" r="0.5" fill="white" opacity="0.8" />
      <circle cx="15" cy="12.5" r="0.5" fill="white" opacity="0.8" />
      {/* Nose */}
      <path
        d="M12 16 L10.5 18 L13.5 18 Z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Mouth */}
      <path
        d="M10.5 18 Q12 20 13.5 18"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.6"
      />
      {/* Whiskers left */}
      <line x1="3" y1="14" x2="8" y2="15" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <line x1="3" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <line x1="3" y1="18" x2="8" y2="17" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      {/* Whiskers right */}
      <line x1="21" y1="14" x2="16" y2="15" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <line x1="21" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <line x1="21" y1="18" x2="16" y2="17" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
    </svg>
  );
}

// 🐾 Paw print icon
export function PawIcon({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("text-current", className)}
    >
      {/* Main pad */}
      <ellipse cx="12" cy="16" rx="5" ry="4" />
      {/* Top pads */}
      <ellipse cx="7" cy="9" rx="2.5" ry="3" />
      <ellipse cx="17" cy="9" rx="2.5" ry="3" />
      <ellipse cx="10" cy="6" rx="2" ry="2.5" />
      <ellipse cx="14" cy="6" rx="2" ry="2.5" />
    </svg>
  );
}

// 🐱 Cat with timer (for Focus tab)
export function CatTimerIcon({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {/* Cat silhouette curled */}
      <path
        d="M6 18 Q4 16 5 13 Q6 10 9 9 L11 7 L10 9 Q12 8 14 9 L16 7 L15 9 Q18 10 19 13 Q20 16 18 18 Q15 20 12 20 Q9 20 6 18 Z"
        fill="currentColor"
        opacity="0.3"
      />
      {/* Inner ear */}
      <path d="M10 9.5 L11 7.5 L10.5 9 Z" fill="currentColor" opacity="0.5" />
      <path d="M14 9.5 L13 7.5 L13.5 9 Z" fill="currentColor" opacity="0.5" />
      {/* Eyes (closed - sleeping) */}
      <path d="M9 12 Q10 13 11 12" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M13 12 Q14 13 15 12" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Clock circle overlay */}
      <circle cx="12" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
      {/* Clock hands */}
      <line x1="12" y1="14" x2="12" y2="11.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="12" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// 🐱 Cat with chart (for Analytics tab)
export function CatChartIcon({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {/* Chart bars */}
      <rect x="4" y="14" width="3" height="6" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="10" y="10" width="3" height="10" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="16" y="6" width="3" height="14" rx="1" fill="currentColor" opacity="0.6" />
      {/* Cat paw pointing */}
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="10" cy="6" r="1" fill="currentColor" />
      <circle cx="7" cy="4.5" r="0.8" fill="currentColor" />
      <circle cx="9" cy="4.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

// 🐱 Two cats together (for Sync Mode)
export function CatCoupleIcon({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {/* Left cat */}
      <ellipse cx="7" cy="16" rx="5" ry="4" fill="currentColor" opacity="0.3" />
      <path d="M3 14 L5 17 L2.5 16 Z" fill="currentColor" opacity="0.4" />
      <path d="M8 13 L10 10 L11 14 Z" fill="currentColor" opacity="0.4" />
      <circle cx="5" cy="15" r="0.8" fill="currentColor" />
      <circle cx="8" cy="15" r="0.8" fill="currentColor" />
      
      {/* Right cat */}
      <ellipse cx="17" cy="16" rx="5" ry="4" fill="currentColor" opacity="0.3" />
      <path d="M21 14 L19 17 L21.5 16 Z" fill="currentColor" opacity="0.4" />
      <path d="M16 13 L14 10 L13 14 Z" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="15" r="0.8" fill="currentColor" />
      <circle cx="19" cy="15" r="0.8" fill="currentColor" />
      
      {/* Heart between */}
      <path
        d="M12 10 C10 8 8 10 12 14 C16 10 14 8 12 10"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

// 🐱 Cat with list (for Tasks tab)
export function CatTaskIcon({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {/* List lines */}
      <line x1="10" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      
      {/* Paw checkboxes */}
      <circle cx="5" cy="6" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="4" cy="4.5" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="6" cy="4.5" r="1" fill="currentColor" opacity="0.5" />
      
      <circle cx="5" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="4" cy="10.5" r="1" fill="currentColor" opacity="0.7" />
      <circle cx="6" cy="10.5" r="1" fill="currentColor" opacity="0.7" />
      
      <circle cx="5" cy="18" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="4" cy="16.5" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="6" cy="16.5" r="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// 🐱 Cat profile (for Profile tab)
export function CatProfileIcon({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {/* Cat face in circle frame */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
      
      {/* Ears */}
      <path d="M6 8 L8 12 L5 11 Z" fill="currentColor" opacity="0.4" />
      <path d="M18 8 L16 12 L19 11 Z" fill="currentColor" opacity="0.4" />
      
      {/* Face */}
      <ellipse cx="12" cy="13" rx="6" ry="5" fill="currentColor" opacity="0.2" />
      
      {/* Eyes */}
      <ellipse cx="9.5" cy="12" rx="1.2" ry="1.5" fill="currentColor" />
      <ellipse cx="14.5" cy="12" rx="1.2" ry="1.5" fill="currentColor" />
      
      {/* Nose */}
      <path d="M12 14.5 L11 16 L13 16 Z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

// 🐱 Cat community (for Community tab)
export function CatCommunityIcon({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {/* Multiple cat silhouettes */}
      <ellipse cx="6" cy="18" rx="4" ry="3" fill="currentColor" opacity="0.25" />
      <path d="M3 16 L4.5 18 L2.5 17.5 Z" fill="currentColor" opacity="0.3" />
      <path d="M7 16 L8.5 14 L9 17 Z" fill="currentColor" opacity="0.3" />
      
      <ellipse cx="12" cy="16" rx="4" ry="3" fill="currentColor" opacity="0.35" />
      <path d="M9 14 L10.5 16 L8.5 15.5 Z" fill="currentColor" opacity="0.4" />
      <path d="M13 13 L14.5 11 L15 14 Z" fill="currentColor" opacity="0.4" />
      
      <ellipse cx="18" cy="18" rx="4" ry="3" fill="currentColor" opacity="0.25" />
      <path d="M15 16 L16.5 18 L14.5 17.5 Z" fill="currentColor" opacity="0.3" />
      <path d="M19 16 L20.5 14 L21 17 Z" fill="currentColor" opacity="0.3" />
      
      {/* Eyes */}
      <circle cx="5" cy="17" r="0.5" fill="currentColor" />
      <circle cx="7" cy="17" r="0.5" fill="currentColor" />
      <circle cx="11" cy="15" r="0.5" fill="currentColor" />
      <circle cx="13" cy="15" r="0.5" fill="currentColor" />
      <circle cx="17" cy="17" r="0.5" fill="currentColor" />
      <circle cx="19" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}

// 🐱 Cat dashboard (for Dashboard tab)
export function CatDashboardIcon({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {/* Grid layout */}
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="13" y="3" width="8" height="5" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="13" y="10" width="8" height="11" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.25" />
      
      {/* Cat sitting in main panel */}
      <ellipse cx="7" cy="7" rx="2.5" ry="2" fill="currentColor" opacity="0.5" />
      <path d="M5 5.5 L5.5 7 L4.5 6.5 Z" fill="currentColor" opacity="0.6" />
      <path d="M8.5 5 L9 7 L8 6.5 Z" fill="currentColor" opacity="0.6" />
      <circle cx="6" cy="6.5" r="0.4" fill="currentColor" />
      <circle cx="7.5" cy="6.5" r="0.4" fill="currentColor" />
    </svg>
  );
}

// 🐱 Tail loader spinner
export function CatTailSpinner({ className, size = 24 }: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current animate-spin", className)}
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path
        d="M12 4 A8 8 0 0 1 20 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Tail tip */}
      <circle cx="20" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}