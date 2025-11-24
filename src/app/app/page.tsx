'use client'

import Link from 'next/link'
import { BookOpen, Users, Sparkles, History, Play, CheckCircle2, Lightbulb, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import ActivityFeed from '@/components/ActivityFeed'
import RunMetricsCard from '@/components/RunMetricsCard'

export default function DashboardPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([])
  const [activeRuns, setActiveRuns] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const workspace = { id: '1', name: 'Demo Workspace' }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch playbooks
        const playbooksResponse = await fetch('/api/playbooks?workspaceId=1')
        if (playbooksResponse.ok) {
          const playbooksData = await playbooksResponse.json()
          setPlaybooks(playbooksData)
        }

        // Fetch active runs
        const runsResponse = await fetch('/api/runs?workspaceId=1&status=active')
        if (runsResponse.ok) {
          const runsData = await runsResponse.json()
          setActiveRuns(runsData)
        }

        // Fetch recommendations
        const recsResponse = await fetch('/api/recommendations?workspaceId=1')
        if (recsResponse.ok) {
          const recsData = await recsResponse.json()
          setRecommendations(recsData)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const playbookCount = playbooks.length
  const memberCount = 1
  const questionCount = 0
  const recentPlaybooks = playbooks.slice(0, 5) // Show 5 most recent

  const statsArray = [
    { label: 'Playbooks', value: playbookCount, icon: BookOpen, color: 'blue' },
    { label: 'Team Members', value: memberCount, icon: Users, color: 'green' },
    { label: 'Questions Asked', value: questionCount, icon: Sparkles, color: 'yellow' },
    { label: 'Activity', value: 'Active', icon: History, color: 'cyan' },
  ]

  return (
    <div className="space-y-4 max-w-full">
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'inherit' }}>Welcome back to {workspace.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsArray.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <div className={`p-2 rounded bg-${stat.color}-600/10`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Run Metrics */}
      <RunMetricsCard />

      {/* Active Runs */}
      {activeRuns.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-5 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Play className="w-5 h-5" style={{ color: 'rgba(0, 120, 212, 0.9)' }} />
                Active Runs
              </h2>
              <Link href="/app/runs" className="text-sm text-link" style={{ color: 'var(--text-accent)' }}>
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
            {activeRuns.map((run: any) => (
              <Link
                key={run.id}
                href={`/app/runs/${run.id}`}
                className="block p-4 hover-subtle"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{run.playbookTitle}</h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>Started by {run.startedBy.name}</span>
                      <span>{new Date(run.startedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold" style={{ 
                        color: run.progress === 100 ? 'rgba(16, 185, 129, 1)' : 'rgba(0, 120, 212, 0.9)',
                        fontSize: '1.25rem'
                      }}>
                        {run.progress}%
                      </div>
                    </div>
                    {run.progress === 100 && (
                      <CheckCircle2 className="w-5 h-5" style={{ color: 'rgba(16, 185, 129, 1)' }} />
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${run.progress}%`,
                      backgroundColor: run.progress === 100 ? 'rgba(16, 185, 129, 1)' : 'rgba(0, 120, 212, 0.9)'
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Playbooks */}
      {recommendations.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-5 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Lightbulb className="w-5 h-5" style={{ color: 'rgba(251, 191, 36, 0.9)' }} />
                Recommended for You
              </h2>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
            {recommendations.map((playbook: any) => (
              <Link
                key={playbook.id}
                href={`/app/playbooks/${playbook.id}`}
                className="block p-4 hover-subtle"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{playbook.title}</h3>
                    {playbook.description && (
                      <p className="text-sm line-clamp-1 mb-2" style={{ color: 'var(--text-secondary)' }}>{playbook.description}</p>
                    )}
                    {playbook.recommendationReasons && playbook.recommendationReasons.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {playbook.recommendationReasons.slice(0, 2).map((reason: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: 'rgba(251, 191, 36, 0.15)',
                              color: 'rgba(251, 191, 36, 0.9)',
                              border: '1px solid rgba(251, 191, 36, 0.3)'
                            }}
                          >
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Playbooks */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Playbooks</h2>
            <Link href="/app/playbooks" className="text-sm text-link" style={{ color: 'var(--text-accent)' }}>
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
          {recentPlaybooks.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No playbooks yet</p>
              <Link href="/app/playbooks/new" className="text-sm mt-2 inline-block text-link" style={{ color: 'var(--text-accent)' }}>
                Create your first playbook
              </Link>
            </div>
          ) : (
            recentPlaybooks.map((playbook: any) => (
              <Link
                key={playbook.id}
                href={`/app/playbooks/${playbook.id}`}
                className="block p-4 hover-subtle"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{playbook.title}</h3>
                    {playbook.description && (
                      <p className="text-sm line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{playbook.description}</p>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(playbook.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Team Activity */}
      <ActivityFeed />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link
          href="/app/playbooks/new"
          className="rounded-lg p-5 transition-all hover-lift"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--info) 100%)',
          }}
        >
          <BookOpen className="w-8 h-8 text-white mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Create Playbook</h3>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Document a new process or procedure</p>
        </Link>

        <Link
          href="/app/ask"
          className="rounded-lg p-5 transition-all hover-lift"
          style={{
            background: 'linear-gradient(135deg, var(--success) 0%, var(--info) 100%)',
          }}
        >
          <Sparkles className="w-8 h-8 text-white mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Ask OpAtlas</h3>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Get AI-powered answers from your playbooks</p>
        </Link>
      </div>
    </div>
  )
}
