"use client";

import React from "react";

export interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * High-definition Vector Icon Mark for Lucky Ticket / LuckyEthio:
 * Glowing angled golden ticket with deep cobalt blue core, perforated stitch, LT monogram,
 * radiant starburst flares, and a faceted 3D metallic golden star.
 */
export function LuckyTicketIcon({ size = 40, className = "", ...props }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      {...props}
    >
      <defs>
        {/* Soft Golden Outer Aura Glow */}
        <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="star-glow" x="-30%" y="-30%" width="160%" height="160%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="8" result="blur2" />
          <feComposite in="SourceGraphic" in2="blur2" operator="over" />
        </filter>

        {/* Ticket Outer Gold Gradient */}
        <linearGradient id="ticket-gold-border" x1="40" y1="160" x2="150" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="30%" stopColor="#FBBF24" />
          <stop offset="70%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Ticket Blue Core Gradient */}
        <linearGradient id="ticket-blue-core" x1="60" y1="140" x2="135" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1938" />
          <stop offset="40%" stopColor="#173B8A" />
          <stop offset="70%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* 3D Star Facet Gradients */}
        <linearGradient id="star-facet-light" x1="120" y1="20" x2="145" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="60%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <linearGradient id="star-facet-mid" x1="100" y1="40" x2="145" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="star-facet-dark" x1="145" y1="65" x2="170" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Light Flare Rays */}
        <linearGradient id="ray-grad" x1="90" y1="100" x2="145" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
          <stop offset="70%" stopColor="#93C5FD" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* TICKET BODY GROUP (Rotated ~40 deg) */}
      <g filter="url(#gold-glow)">
        {/* Glow backdrop outline */}
        <path
          d="M 68 152 
             C 60 144, 52 144, 44 152
             L 36 144
             C 44 136, 44 128, 36 120
             L 105 51
             C 113 59, 121 59, 129 51
             L 137 59
             C 129 67, 129 75, 137 83
             Z"
          fill="#F59E0B"
          opacity="0.3"
          transform="scale(1.08) translate(-6, -6)"
        />

        {/* Golden Ticket Outer Bezel with Notches */}
        <path
          d="M 72 156
             C 62 146, 52 146, 42 156
             L 34 148
             C 44 138, 44 128, 34 118
             L 106 46
             C 116 56, 126 56, 136 46
             L 144 54
             C 134 64, 134 74, 144 84
             L 72 156 Z"
          fill="url(#ticket-gold-border)"
          stroke="#FDE68A"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Inner Blue Ticket Card */}
        <path
          d="M 70 148
             C 63 140, 55 140, 48 148
             L 41 141
             C 49 134, 49 126, 41 119
             L 105 55
             C 112 63, 120 63, 127 55
             L 134 62
             C 126 69, 126 77, 134 84
             L 70 148 Z"
          fill="url(#ticket-blue-core)"
        />

        {/* Perforated Stub Line (dashed gold) */}
        <line
          x1="52"
          y1="130"
          x2="95"
          y2="87"
          stroke="#FBBF24"
          strokeWidth="3.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* "LT" Monogram Stamp on Stub */}
        <text
          x="62"
          y="136"
          fill="#FDE68A"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          letterSpacing="1"
          opacity="0.95"
        >
          LT
        </text>

        {/* Radiant Speed/Light Rays Erupting from Blue Core toward Star */}
        <path d="M 78 115 L 140 68" stroke="url(#ray-grad)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        <path d="M 88 118 L 142 66" stroke="url(#ray-grad)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 98 112 L 144 70" stroke="url(#ray-grad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* 3D FACETED GOLDEN STAR (Top-Right Crown) */}
      <g filter="url(#star-glow)">
        {/* Star Center Coordinate: (145, 65) */}

        {/* Point 1: Top (145, 20) */}
        <polygon points="145,20 145,65 133,52" fill="url(#star-facet-light)" />
        <polygon points="145,20 145,65 157,52" fill="url(#star-facet-mid)" />

        {/* Point 2: Right (185, 52) */}
        <polygon points="185,52 145,65 157,52" fill="url(#star-facet-light)" />
        <polygon points="185,52 145,65 160,78" fill="url(#star-facet-dark)" />

        {/* Point 3: Bottom Right (170, 102) */}
        <polygon points="170,102 145,65 160,78" fill="url(#star-facet-mid)" />
        <polygon points="170,102 145,65 145,86" fill="url(#star-facet-dark)" />

        {/* Point 4: Bottom Left (120, 102) */}
        <polygon points="120,102 145,65 145,86" fill="url(#star-facet-mid)" />
        <polygon points="120,102 145,65 130,78" fill="url(#star-facet-dark)" />

        {/* Point 5: Left (105, 52) */}
        <polygon points="105,52 145,65 130,78" fill="url(#star-facet-light)" />
        <polygon points="105,52 145,65 133,52" fill="url(#star-facet-mid)" />

        {/* Star Outer Golden Rim */}
        <polygon
          points="145,20 157,52 185,52 160,78 170,102 145,86 120,102 130,78 105,52 133,52"
          fill="none"
          stroke="#FFFBEB"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Sparkling Center Highlight */}
        <circle cx="145" cy="65" r="3.5" fill="#FFFFFF" opacity="0.9" />
      </g>
    </svg>
  );
}

export interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  subtitleText?: string;
  themeMode?: "dark" | "light" | "auto";
  className?: string;
}

/**
 * Complete Responsive Brand Logo with Icon & Typography
 */
export function LuckyTicketLogo({
  size = "md",
  showSubtitle = true,
  subtitleText,
  className = "",
}: LogoProps) {
  const iconSizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const titleSizes = {
    sm: "text-base tracking-tight",
    md: "text-lg tracking-tight",
    lg: "text-2xl tracking-tight",
    xl: "text-3xl tracking-tight",
  };

  const subSizes = {
    sm: "text-[9px] tracking-wider",
    md: "text-[10px] tracking-wider",
    lg: "text-xs tracking-wider",
    xl: "text-sm tracking-widest",
  };

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* 3D Glowing Ticket Star Icon */}
      <div className="relative group-hover:scale-105 transition-transform duration-200 shrink-0">
        <LuckyTicketIcon size={iconSizes[size]} />
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className={`font-black text-amber-500 dark:text-amber-400 font-sans uppercase flex items-center leading-none ${titleSizes[size]}`}>
          <span>LUCKY</span>
          <span className="text-amber-400 dark:text-amber-300 ml-1.5">TICKET</span>
        </div>

        {showSubtitle && (
          <span className={`font-black text-blue-600 dark:text-blue-400 uppercase font-mono mt-0.5 leading-none ${subSizes[size]}`}>
            {subtitleText || "DIGITAL RAFFLE PLATFORM"}
          </span>
        )}
      </div>
    </div>
  );
}

