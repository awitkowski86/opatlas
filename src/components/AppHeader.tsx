'use client'

import { Bell, HelpCircle, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import NotificationCenter from './NotificationCenter'

interface AppHeaderProps {
  workspace: { id: string; name: string }
  user: { id: string; name?: string | null; email?: string | null; image?: string | null }
  role: 'owner' | 'editor' | 'viewer'
}

export default function AppHeader({ workspace, user, role }: AppHeaderProps) {
  return (
    <header className="h-12 border-b flex items-center justify-between px-4" style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottomColor: 'var(--border-primary)',
      borderLeftWidth: '1px',
      borderLeftColor: 'var(--border-primary)'
    }}>
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {workspace.name}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        {/* New Playbook Button */}
        <Link
          href="/app/playbooks/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{
            backgroundColor: 'var(--text-accent)',
            color: 'white'
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </Link>

        {/* Icon Buttons */}
        <button
          className="p-2 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <NotificationCenter />

        <button
          className="p-2 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="ml-2">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-7 h-7 rounded-full cursor-pointer"
              style={{ border: '1px solid var(--border-primary)' }}
            />
          ) : (
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer" 
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)'
              }}
              title={user.name || user.email || 'User'}
            >
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
