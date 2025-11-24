'use client'

import { useEffect, useState } from 'react'
import { Bell, X, MessageSquare, UserPlus, CheckCircle2 } from 'lucide-react'

interface Notification {
  id: string
  type: 'mention' | 'assignment' | 'completion'
  title: string
  message: string
  link: string
  timestamp: string
  read: boolean
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load notifications from localStorage
    const stored = localStorage.getItem('notifications')
    if (stored) {
      const parsed = JSON.parse(stored)
      setNotifications(parsed)
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
    }

    // Listen for new notifications
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      const newNotification = event.detail
      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, 50) // Keep last 50
        localStorage.setItem('notifications', JSON.stringify(updated))
        return updated
      })
      setUnreadCount(prev => prev + 1)
    }

    window.addEventListener('new-notification' as any, handleNewNotification)
    return () => {
      window.removeEventListener('new-notification' as any, handleNewNotification)
    }
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
    setUnreadCount(0)
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id)
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      const updated = prev.filter(n => n.id !== id)
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mention':
        return <MessageSquare className="w-4 h-4" style={{ color: 'rgba(168, 85, 247, 1)' }} />
      case 'assignment':
        return <UserPlus className="w-4 h-4" style={{ color: 'rgba(251, 146, 60, 1)' }} />
      case 'completion':
        return <CheckCircle2 className="w-4 h-4" style={{ color: 'rgba(16, 185, 129, 1)' }} />
    }
  }

  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return then.toLocaleDateString()
  }

  return (
    <>
      {/* Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-lg transition-all"
        style={{
          backgroundColor: showPanel ? 'var(--bg-tertiary)' : 'transparent',
          color: 'var(--text-primary)'
        }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 1)',
              color: 'white'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div 
            className="fixed right-4 top-16 w-96 max-h-[500px] border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-secondary)'
            }}
          >
            {/* Header */}
            <div 
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-secondary)' }}
            >
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs transition-all hover:underline"
                  style={{ color: 'var(--text-accent)' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-secondary)' }}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 transition-all hover:bg-opacity-50 relative group"
                      style={{
                        backgroundColor: notification.read ? 'transparent' : 'rgba(0, 120, 212, 0.05)'
                      }}
                    >
                      <a
                        href={notification.link}
                        onClick={() => {
                          markAsRead(notification.id)
                          setShowPanel(false)
                        }}
                        className="block"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                              {notification.title}
                            </p>
                            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {notification.message}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {getRelativeTime(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                              style={{ backgroundColor: 'rgba(0, 120, 212, 1)' }}
                            />
                          )}
                        </div>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          clearNotification(notification.id)
                        }}
                        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

// Helper function to send notifications
export function sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    read: false
  }

  const event = new CustomEvent('new-notification', { detail: newNotification })
  window.dispatchEvent(event)
}
