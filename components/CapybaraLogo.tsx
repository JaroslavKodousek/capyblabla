import React from 'react';

const CapybaraLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 800"
    {...props}
    aria-label="CapyBlaBla Logo"
    role="img"
  >
    <g>
      <ellipse cx="400" cy="580" rx="280" ry="40" fill="rgba(0,0,0,0.08)" />
      
      {/* Back Right Foot */}
      <path fill="#855B32" d="M520 480 Q 530 550, 500 560 T 460 540 L 470 470 Z" />
      
      {/* Body */}
      <path 
        fill="#C68E5E" 
        d="M175,400 C150,250 300,100 400,120 C500,140 650,250 625,400 C600,550 450,600 350,580 C250,560 200,550 175,400 Z"
      />
      
      {/* Front Left Foot */}
      <path fill="#855B32" d="M320 490 Q 300 560, 270 550 T 240 500 L 280 480 Z" />
      {/* Front Right Foot */}
      <path fill="#855B32" d="M430 480 Q 410 550, 380 540 T 350 490 L 390 470 Z" />
      
      {/* Face and Head */}
      <path 
        fill="#C68E5E" 
        d="M280,380 C220,280 300,150 400,160 C500,170 580,280 520,380 L 480 430 Q 400 450 320 430 Z"
      />
      
      {/* Ears */}
      <path fill="#AF7E55" d="M480 180 Q 510 150, 520 180 T 490 200 Z" />
      <path fill="#AF7E55" d="M320 180 Q 290 150, 280 180 T 310 200 Z" />
      
      {/* Eyes */}
      <ellipse fill="#3C2E1A" cx="463" cy="246" rx="14" ry="18" />
      <circle fill="#FFFFFF" cx="469" cy="240" r="4" />
      <ellipse fill="#3C2E1A" cx="337" cy="246" rx="14" ry="18" />
      <circle fill="#FFFFFF" cx="331" cy="240" r="4" />

      {/* Nose */}
      <path 
        fill="#855B32" 
        d="M360,320 C350,300 450,300 440,320 C460,340 340,340 360,320 Z"
      />
      <path fill="#6A4A2A" d="M375,322 a 5,5 0 0,1 10,0 a 5,5 0 0,1 -10,0" />
      <path fill="#6A4A2A" d="M415,322 a 5,5 0 0,1 10,0 a 5,5 0 0,1 -10,0" />

      {/* Mouth */}
      <path d="M380 350 c 5 5, 30 5, 40 0" stroke="#3C2E1A" strokeWidth="3" fill="none" strokeLinecap="round" />
       <path d="M400 350 v -10" stroke="#3C2E1A" strokeWidth="3" fill="none" strokeLinecap="round" />

    </g>
  </svg>
);

export default CapybaraLogo;
