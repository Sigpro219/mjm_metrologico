
export const ColoredBlocks = ({ className }: { className?: string }) => (
  <svg width="100" height="80" viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Block 1 (Top Left) */}
    <path d="M0 25 L25 10 L50 25 L25 40 Z" fill="#FCE876" opacity="0.9" /> {/* Top yellow light */}
    <path d="M0 25 L25 40 L25 70 L0 55 Z" fill="#E5E7EB" /> {/* Left side light grey */}
    <path d="M25 40 L50 25 L50 55 L25 70 Z" fill="#9CA3AF" /> {/* Right side grey */}

    {/* Block 2 (Bottom Right - Overlapping?) */}
    <path d="M35 15 L60 0 L85 15 L60 30 Z" fill="#FADA25" /> {/* Top yellow strong */}
    <path d="M35 15 L60 30 L60 60 L35 45 Z" fill="#D1D5DB" /> {/* Left side grey */}
    <path d="M60 30 L85 15 L85 45 L60 60 Z" fill="#68696B" /> {/* Right side dark grey */}
  </svg>
);

export const WireframeCubes = ({ className }: { className?: string }) => (
  <svg width="200" height="400" viewBox="0 0 100 200" className={className} fill="none" stroke="currentColor" strokeWidth="0.3" xmlns="http://www.w3.org/2000/svg">
     {/* Large minimalistic cubes based on reference */}
     {/* Vertical scale logic: Hexagon grid */}
     
     {/* Cube 1 (Top Left most) */}
     <path d="M0 30 L25 15 L50 30 L25 45 Z" />
     <path d="M0 30 L0 80 L25 95 L25 45" />
     <path d="M50 30 L50 80 L25 95" />

     {/* Cube 2 (Below Cube 1) */}
     <path d="M25 95 L25 145 L0 130 " />
     <path d="M0 130 L0 80" /> {/* Connects back */}
     
     {/* Cube 3 (Right of Cube 1) */}
     <path d="M50 30 L75 15 L100 30 L75 45 L50 30" />
     <path d="M100 30 L100 80 L75 95 L75 45" />
     <path d="M50 80 L50 30" /> {/* Duplicate line? */}
     
     {/* Cube 4 (Below Cube 3 / Right of Cube 2) */}
     <path d="M50 80 L75 95 L75 145 L50 130 L50 80" />
     <path d="M25 95 L50 80" /> {/* Connection */}
     
     {/* Cube 5 (Bottom) */}
     <path d="M25 145 L50 130 L75 145 L50 160 L25 145" />
     <path d="M50 160 L50 210" />

  </svg>
);
