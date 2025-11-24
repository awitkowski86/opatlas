'use client'

import { useEffect, useState } from 'react'
import { Play, CheckCircle2, MessageSquare, UserPlus, Clock } from 'lucide-react'
import { LoadingInline } from './LoadingSpinner'

interface Activity {
  id: string
  type: 'run_started' | 'run_completed' | 'step_checked' | 'comment_added' | 'run_assigned'
  userName: string
  playbookTitle: string
  runId: string
  timestamp: string
  details?: string
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API endpoint
    // For now, we'll generate mock activities from runs
    const fetchActivities = async () => {
      try {
        const runsResponse = await fetch('/api/runs?status=all')
        const runs = await runsResponse.json()

        const playbooksResponse = await fetch('/api/playbooks')
        const playbooks = await playbooksResponse.json()

        // Generate activities from runs
        const generatedActivities: Activity[] = []

        runs.forEach((run: any) => {
          const playbook = playbooks.find((p: any) => p.id === run.playbookId)
          if (!playbook) return

          // Run started
          generatedActivities.push({
            id: `${run.id}-started`,
            type: 'run_started',
            userName: run.startedBy.name,
            playbookTitle: playbook.title,
            runId: run.id,
            timestamp: run.startedAt
          })

          // Run assigned
          if (run.assignedTo) {
            generatedActivities.push({
              id: `${run.id}-assigned`,
              type: 'run_assigned',
              userName: run.startedBy.name,
              playbookTitle: playbook.title,
              runId: run.id,
              timestamp: run.startedAt,
              details: run.assignedTo.name
            })
          }

          // Comments
          if (run.comments && run.comments.length > 0) {
            run.comments.forEach((comment: any) => {
              generatedActivities.push({
                id: comment.id,
                type: 'comment_added',
                userName: comment.userName,
                playbookTitle: playbook.title,
                runId: run.id,
                timestamp: comment.createdAt,
                details: comment.text
              })
            })
          }

          // Run completed
          if (run.status === 'completed') {
            generatedActivities.push({
              id: `${run.id}-completed`,
              type: 'run_completed',
              userName: run.startedBy.name,
              playbookTitle: playbook.title,
              runId: run.id,
              timestamp: run.completedAt || run.updatedAt
            })
          }
        })

        // Sort by most recent first
        generatedActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        setActivities(generatedActivities.slice(0, 10)) // Show latest 10
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'run_started':
        return <Play className="w-4 h-4" style={{ color: 'rgba(0, 120, 212, 1)' }} />
      case 'run_completed':
        return <CheckCircle2 className="w-4 h-4" style={{ color: 'rgba(16, 185, 129, 1)' }} />
      case 'comment_added':
        return <MessageSquare className="w-4 h-4" style={{ color: 'rgba(168, 85, 247, 1)' }} />
      case 'run_assigned':
        return <UserPlus className="w-4 h-4" style={{ color: 'rgba(251, 146, 60, 1)' }} />
      default:
        return <Clock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'run_started':
        return (
          <>
            <span className="font-medium">{activity.userName}</span> started{' '}
            <span className="font-medium">{activity.playbookTitle}</span>
          </>
        )
      case 'run_completed':
        return (
          <>
            <span className="font-medium">{activity.userName}</span> completed{' '}
            <span className="font-medium">{activity.playbookTitle}</span>
          </>
        )
      case 'comment_added':
        return (
          <>
            <span className="font-medium">{activity.userName}</span> commented on{' '}
            <span className="font-medium">{activity.playbookTitle}</span>
            {activity.details && (
              <div className="mt-1 text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                "{activity.details.substring(0, 60)}{activity.details.length > 60 ? '...' : ''}"
              </div>
            )}
          </>
        )
      case 'run_assigned':
        return (
          <>
            <span className="font-medium">{activity.userName}</span> assigned{' '}
            <span className="font-medium">{activity.playbookTitle}</span> to{' '}
            <span className="font-medium">{activity.details}</span>
          </>
        )
      default:
        return <span>Activity</span>
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

  if (loading) {
    return (
      <div className="border rounded-lg p-6" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-secondary)'
      }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Team Activity
        </h2>
        <LoadingInline message="Loading activity..." />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="border rounded-lg p-6" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-secondary)'
      }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Team Activity
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No recent activity. Start running playbooks to see team actions here.
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6" style={{
      backgroundColor: 'var(--bg-secondary)',
      borderColor: 'var(--border-secondary)'
    }}>
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Team Activity
      </h2>

      <div className="space-y-3">
        {activities.map((activity) => (
          <a
            key={activity.id}
            href={`/app/runs/${activity.runId}`}
            className="flex items-start gap-3 p-3 rounded transition-all hover:scale-[1.01]"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderLeft: '3px solid var(--border-secondary)'
            }}
          >
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {getActivityText(activity)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {getRelativeTime(activity.timestamp)}
              </p>
            </div>
          </a>
        ))}
      </div>

      <a
        href="/app/runs"
        className="block mt-4 text-center text-sm transition-all hover:underline"
        style={{ color: 'var(--text-accent)' }}
      >
        View all runs →
      </a>
    </div>
  )
}
