'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

interface PresenceUser {
  id: string
  name: string
  location: string // e.g., "playbook:123" or "run:456"
  timestamp: number
}

const PRESENCE_KEY = 'user-presence'
const PRESENCE_TIMEOUT = 60000 // 1 minute

// Simulate team members being active
const MOCK_USERS = [
  { id: '2', name: 'Alice Johnson' },
  { id: '3', name: 'Bob Smith' },
  { id: '4', name: 'Carol Williams' },
  { id: '5', name: 'David Brown' }
]

export function usePresence(location: string) {
  const [viewers, setViewers] = useState<PresenceUser[]>([])

  useEffect(() => {
    // Update own presence
    const updatePresence = () => {
      const currentUser: PresenceUser = {
        id: '1',
        name: 'Demo User',
        location,
        timestamp: Date.now()
      }

      const stored = localStorage.getItem(PRESENCE_KEY)
      let allPresence: PresenceUser[] = stored ? JSON.parse(stored) : []

      // Remove stale presence (older than timeout)
      const now = Date.now()
      allPresence = allPresence.filter(p => now - p.timestamp < PRESENCE_TIMEOUT)

      // Update or add current user
      const existingIndex = allPresence.findIndex(p => p.id === currentUser.id)
      if (existingIndex !== -1) {
        allPresence[existingIndex] = currentUser
      } else {
        allPresence.push(currentUser)
      }

      // Add some mock users occasionally for demo
      if (Math.random() < 0.3) {
        const mockUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)]
        const mockLocations = ['dashboard', location, 'playbook:1', 'run:2']
        const mockLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)]
        
        const mockPresence: PresenceUser = {
          id: mockUser.id,
          name: mockUser.name,
          location: mockLocation,
          timestamp: now
        }

        const mockIndex = allPresence.findIndex(p => p.id === mockUser.id)
        if (mockIndex !== -1) {
          allPresence[mockIndex] = mockPresence
        } else {
          allPresence.push(mockPresence)
        }
      }

      localStorage.setItem(PRESENCE_KEY, JSON.stringify(allPresence))

      // Filter to current location (exclude self)
      const locationViewers = allPresence.filter(
        p => p.location === location && p.id !== '1'
      )
      setViewers(locationViewers)
    }

    // Initial update
    updatePresence()

    // Update every 10 seconds
    const interval = setInterval(updatePresence, 10000)

    // Cleanup on unmount
    return () => {
      clearInterval(interval)
      
      // Remove own presence
      const stored = localStorage.getItem(PRESENCE_KEY)
      if (stored) {
        let allPresence: PresenceUser[] = JSON.parse(stored)
        allPresence = allPresence.filter(p => p.id !== '1')
        localStorage.setItem(PRESENCE_KEY, JSON.stringify(allPresence))
      }
    }
  }, [location])

  return viewers
}

interface PresenceIndicatorProps {
  location: string
  className?: string
}

export default function PresenceIndicator({ location, className = '' }: PresenceIndicatorProps) {
  const viewers = usePresence(location)

  if (viewers.length === 0) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm" style={{
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        border: '1px solid'
      }}>
        <Eye className="w-4 h-4" style={{ color: 'rgba(16, 185, 129, 1)' }} />
        <span className="font-medium" style={{ color: 'rgba(16, 185, 129, 1)' }}>
          {viewers.length}
        </span>
      </div>
      
      <div className="flex -space-x-2">
        {viewers.slice(0, 3).map((viewer) => (
          <div
            key={viewer.id}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ring-2 ring-white"
            style={{
              backgroundColor: 'var(--text-accent)',
              color: 'white'
            }}
            title={viewer.name}
          >
            {viewer.name.split(' ').map(n => n[0]).join('')}
          </div>
        ))}
        {viewers.length > 3 && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ring-2 ring-white"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)'
            }}
            title={`+${viewers.length - 3} more`}
          >
            +{viewers.length - 3}
          </div>
        )}
      </div>

      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {viewers.length === 1 ? viewers[0].name : `${viewers[0].name} and ${viewers.length - 1} other${viewers.length > 2 ? 's' : ''}`} viewing
      </span>
    </div>
  )
}
