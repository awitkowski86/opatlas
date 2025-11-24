'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Clock, CheckCircle2, BarChart3, Activity } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from './LoadingSpinner'

interface RunMetrics {
  totalRuns: number
  completedRuns: number
  activeRuns: number
  completionRate: number
  avgDuration: number | null
  runsThisWeek: number
  runsLastWeek: number
  recentRuns: Array<{
    id: string
    playbookTitle: string
    status: string
    duration: number | null
    completedAt: string | null
  }>
}

export default function RunMetricsCard() {
  const [metrics, setMetrics] = useState<RunMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/runs?workspaceId=1&status=all')
        if (response.ok) {
          const runs = await response.json()
          
          const completed = runs.filter((r: any) => r.status === 'completed')
          const active = runs.filter((r: any) => r.status === 'in-progress')
          
          // Calculate average duration
          const completedWithDuration = completed.filter((r: any) => r.duration)
          const avgDuration = completedWithDuration.length > 0
            ? completedWithDuration.reduce((sum: number, r: any) => sum + r.duration, 0) / completedWithDuration.length
            : null

          // Calculate runs this week vs last week
          const now = new Date()
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

          const runsThisWeek = runs.filter((r: any) => 
            new Date(r.startedAt) > oneWeekAgo
          ).length

          const runsLastWeek = runs.filter((r: any) => {
            const startDate = new Date(r.startedAt)
            return startDate > twoWeeksAgo && startDate <= oneWeekAgo
          }).length

          setMetrics({
            totalRuns: runs.length,
            completedRuns: completed.length,
            activeRuns: active.length,
            completionRate: runs.length > 0 ? (completed.length / runs.length) * 100 : 0,
            avgDuration,
            runsThisWeek,
            runsLastWeek,
            recentRuns: runs.slice(0, 5)
          })
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  const getTrendIcon = () => {
    if (!metrics) return null
    const growth = ((metrics.runsThisWeek - metrics.runsLastWeek) / Math.max(metrics.runsLastWeek, 1)) * 100
    
    if (growth > 0) {
      return <TrendingUp className="w-4 h-4" style={{ color: 'rgba(16, 185, 129, 1)' }} />
    }
    return <Activity className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
  }

  if (loading) {
    return (
      <div className="border rounded-lg p-6 flex items-center justify-center" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-secondary)'
      }}>
        <div className="text-center py-8">
          <LoadingSpinner size={32} />
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading metrics...</p>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="border rounded-lg p-6" style={{
      backgroundColor: 'var(--bg-secondary)',
      borderColor: 'var(--border-secondary)'
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart3 className="w-5 h-5" />
          Run Metrics
        </h2>
        <Link 
          href="/app/runs"
          className="text-sm transition-all hover:underline"
          style={{ color: 'var(--text-accent)' }}
        >
          View all →
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {metrics.totalRuns}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Runs</div>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'rgba(16, 185, 129, 1)' }}>
            {metrics.completionRate.toFixed(0)}%
          </div>
          <div className="text-xs flex items-center gap-1" style={{ color: 'rgba(16, 185, 129, 1)' }}>
            <CheckCircle2 className="w-3 h-3" />
            Completion Rate
          </div>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 120, 212, 0.1)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'rgba(0, 120, 212, 1)' }}>
            {formatDuration(metrics.avgDuration)}
          </div>
          <div className="text-xs flex items-center gap-1" style={{ color: 'rgba(0, 120, 212, 1)' }}>
            <Clock className="w-3 h-3" />
            Avg Duration
          </div>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <div className="text-2xl font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            {metrics.runsThisWeek}
            {getTrendIcon()}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            This Week
            {metrics.runsLastWeek > 0 && (
              <span className="ml-1">
                ({metrics.runsThisWeek > metrics.runsLastWeek ? '+' : ''}
                {((metrics.runsThisWeek - metrics.runsLastWeek) / metrics.runsLastWeek * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mini Bar Chart - Last 7 Days */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Last 7 Days Activity
        </div>
        <div className="flex items-end gap-2 h-24">
          {[...Array(7)].map((_, i) => {
            const daysAgo = 6 - i
            const date = new Date()
            date.setDate(date.getDate() - daysAgo)
            date.setHours(0, 0, 0, 0)
            
            const nextDay = new Date(date)
            nextDay.setDate(nextDay.getDate() + 1)
            
            const count = metrics.recentRuns.filter((r: any) => {
              const runDate = new Date(r.startedAt)
              return runDate >= date && runDate < nextDay
            }).length

            const maxCount = Math.max(...[...Array(7)].map((_, j) => {
              const d = new Date()
              d.setDate(d.getDate() - (6 - j))
              d.setHours(0, 0, 0, 0)
              const nd = new Date(d)
              nd.setDate(nd.getDate() + 1)
              return metrics.recentRuns.filter((r: any) => {
                const rd = new Date(r.startedAt)
                return rd >= d && rd < nd
              }).length
            }), 1)

            const height = maxCount > 0 ? (count / maxCount) * 100 : 0

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${height}%`,
                    backgroundColor: count > 0 ? 'rgba(0, 120, 212, 0.8)' : 'var(--bg-tertiary)',
                    minHeight: '4px'
                  }}
                  title={`${count} runs on ${date.toLocaleDateString()}`}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(0, 120, 212, 1)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            {metrics.activeRuns} Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 1)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            {metrics.completedRuns} Completed
          </span>
        </div>
      </div>
    </div>
  )
}
