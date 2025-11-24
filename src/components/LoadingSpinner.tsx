'use client'

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export default function LoadingSpinner({ size = 48, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin-slow"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))'
        }}
      >
        {/* Globe circle */}
        <circle 
          cx="12" 
          cy="12" 
          r="9" 
          stroke="url(#globe-gradient-loading)" 
          strokeWidth="1.5" 
          fill="none"
        />
        {/* Latitude lines */}
        <ellipse 
          cx="12" 
          cy="12" 
          rx="9" 
          ry="4" 
          stroke="url(#globe-gradient-loading)" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.6"
        />
        <ellipse 
          cx="12" 
          cy="12" 
          rx="9" 
          ry="6.5" 
          stroke="url(#globe-gradient-loading)" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.4"
        />
        {/* Longitude line */}
        <path 
          d="M 12 3 Q 7 12 12 21 Q 17 12 12 3" 
          stroke="url(#globe-gradient-loading)" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.6"
        />
        {/* Center dot */}
        <circle 
          cx="12" 
          cy="12" 
          r="1.5" 
          fill="url(#globe-gradient-loading)"
        >
          <animate
            attributeName="r"
            values="1.5;2.5;1.5"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.6;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="globe-gradient-loading" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#06b6d4"/>
          </linearGradient>
        </defs>
      </svg>
      
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

// Full page loading component
export function LoadingPage({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      <LoadingSpinner size={64} />
      <p className="mt-6 text-lg font-medium animate-pulse" style={{ 
        color: 'var(--text-secondary)' 
      }}>
        {message}
      </p>
    </div>
  )
}

// Inline loading component
export function LoadingInline({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 py-8" style={{
      color: 'var(--text-secondary)'
    }}>
      <LoadingSpinner size={24} />
      <span className="text-sm">{message}</span>
    </div>
  )
}
