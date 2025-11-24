'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Settings, LayoutDashboard, Terminal, Play } from 'lucide-react'
import { useState } from 'react'

interface AppSidebarProps {
  workspace: { id: string; name: string }
  role: 'owner' | 'editor' | 'viewer'
}

export default function AppSidebar({ workspace, role }: AppSidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const isActive = (path: string) => {
    if (path === '/app') {
      return pathname === '/app'
    }
    return pathname?.startsWith(path)
  }

  const menuItems = [
    { href: '/app', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/app/playbooks', icon: BookOpen, label: 'Playbooks' },
    { href: '/app/runs', icon: Play, label: 'Runs' },
  ]

  return (
    <aside className="w-16 border-r flex flex-col h-full" style={{
      backgroundColor: 'var(--bg-primary)',
      borderRightColor: 'var(--border-primary)'
    }}>
      {/* Logo */}
      <Link 
        href="/app" 
        className="h-12 flex items-center justify-center border-b" 
        style={{ borderBottomColor: 'var(--border-primary)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Globe circle */}
          <circle cx="12" cy="12" r="9" stroke="url(#globe-gradient)" strokeWidth="1.5" fill="none"/>
          {/* Latitude lines */}
          <ellipse cx="12" cy="12" rx="9" ry="4" stroke="url(#globe-gradient)" strokeWidth="1.5" fill="none" opacity="0.6"/>
          <ellipse cx="12" cy="12" rx="9" ry="6.5" stroke="url(#globe-gradient)" strokeWidth="1.5" fill="none" opacity="0.4"/>
          {/* Longitude line */}
          <path d="M 12 3 Q 7 12 12 21 Q 17 12 12 3" stroke="url(#globe-gradient)" strokeWidth="1.5" fill="none" opacity="0.6"/>
          {/* Center dot */}
          <circle cx="12" cy="12" r="1.5" fill="url(#globe-gradient)"/>
          {/* Gradient definition */}
          <defs>
            <linearGradient id="globe-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#06b6d4"/>
            </linearGradient>
          </defs>
        </svg>
      </Link>

      {/* Navigation Icons */}
      <nav className="flex-1 py-4 flex flex-col items-center gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <div key={item.href} className="relative">
              <Link
                href={item.href}
                className="flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-150"
                style={{
                  backgroundColor: active ? 'var(--bg-tertiary)' : 'transparent',
                  color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
                  borderLeft: active ? '2px solid var(--text-accent)' : '2px solid transparent',
                  marginLeft: '-2px'
                }}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </Link>
              
              {/* Tooltip */}
              {hoveredItem === item.href && (
                <div 
                  className="absolute left-full ml-2 px-3 py-1.5 rounded-md text-sm whitespace-nowrap z-50 pointer-events-none"
                  style={{
                    backgroundColor: 'var(--bg-quaternary)',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  {item.label}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      {role === 'owner' && (
        <div className="py-4 border-t flex flex-col items-center" style={{ borderTopColor: 'var(--border-primary)' }}>
          <div className="relative">
            <Link
              href="/app/settings"
              className="flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-150"
              style={{
                backgroundColor: isActive('/app/settings') ? 'var(--bg-tertiary)' : 'transparent',
                color: isActive('/app/settings') ? 'var(--text-accent)' : 'var(--text-secondary)',
                borderLeft: isActive('/app/settings') ? '2px solid var(--text-accent)' : '2px solid transparent',
                marginLeft: '-2px'
              }}
              onMouseEnter={() => setHoveredItem('/app/settings')}
              onMouseLeave={() => setHoveredItem(null)}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
            
            {hoveredItem === '/app/settings' && (
              <div 
                className="absolute left-full ml-2 px-3 py-1.5 rounded-md text-sm whitespace-nowrap z-50 pointer-events-none"
                style={{
                  backgroundColor: 'var(--bg-quaternary)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                Settings
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
