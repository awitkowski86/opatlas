'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Play, CheckCircle2, XCircle, Clock, User, ArrowRight } from 'lucide-react'
import { LoadingInline } from '@/components/LoadingSpinner'

type PlaybookRun = {
  id: string
  playbookId: string
  playbookTitle: string
  status: 'in-progress' | 'completed' | 'abandoned'
  startedAt: string
  completedAt: string | null
  startedBy: {
    id: string
    name: string
  }
  progress: number
}

export default function RunsPage() {
  const [runs, setRuns] = useState<PlaybookRun[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const statusParam = filter === 'all' ? 'all' : filter === 'active' ? 'active' : 'completed'
        const response = await fetch(`/api/runs?workspaceId=1&status=${statusParam}`)
        if (response.ok) {
          const data = await response.json()
          setRuns(data)
        }
      } catch (error) {
        console.error('Failed to load runs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRuns()
  }, [filter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'rgba(16, 185, 129, 1)'
      case 'in-progress':
        return 'rgba(0, 120, 212, 0.9)'
      case 'abandoned':
        return 'rgba(239, 68, 68, 0.9)'
      default:
        return 'var(--text-secondary)'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />
      case 'in-progress':
        return <Play className="w-5 h-5" />
      case 'abandoned':
        return <XCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      case 'abandoned':
        return 'Abandoned'
      default:
        return status
    }
  }

  const calculateDuration = (run: any) => {
    // Use the stored duration if available (more accurate)
    if (run.duration) {
      const ms = run.duration
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return `${days}d ${hours % 24}h`
      if (hours > 0) return `${hours}h ${minutes % 60}m`
      if (minutes > 0) return `${minutes}m`
      return `${seconds}s`
    }
    
    // Fallback to calculating from timestamps
    const start = new Date(run.startedAt)
    const end = run.completedAt ? new Date(run.completedAt) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ${diffHours % 24}h`
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Playbook Runs</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {runs.length} {runs.length === 1 ? 'run' : 'runs'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-lg" style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-secondary)'
        }}>
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: filter === f ? 'rgba(0, 120, 212, 0.9)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-secondary)'
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingInline message="Loading runs..." />
      ) : runs.length === 0 ? (
        <div className="text-center py-16 border rounded-xl" style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}>
          <Play className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No runs yet</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Start executing playbooks to track your progress
          </p>
          <Link
            href="/app/playbooks"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover-lift"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white'
            }}
          >
            Browse Playbooks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {runs.map((run) => (
            <Link
              key={run.id}
              href={`/app/runs/${run.id}`}
              className="block rounded-xl transition-all hover-lift"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                padding: '1.5rem'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {run.playbookTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {run.startedBy.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Started {new Date(run.startedAt).toLocaleString()}
                    </div>
                    {run.completedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed {new Date(run.completedAt).toLocaleString()}
                      </div>
                    )}
                    <div className="px-2 py-1 rounded text-xs font-medium" style={{
                      backgroundColor: `${getStatusColor(run.status)}20`,
                      color: getStatusColor(run.status)
                    }}>
                      {calculateDuration(run)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold mb-1" style={{ color: getStatusColor(run.status) }}>
                      {run.progress}%
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: getStatusColor(run.status) }}>
                      {getStatusIcon(run.status)}
                      {getStatusLabel(run.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${run.progress}%`,
                    backgroundColor: getStatusColor(run.status)
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
