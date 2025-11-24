'use client'

import Link from 'next/link'
import { Plus, Clock, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([])
  const canEdit = true // Demo: everyone can edit

  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        const response = await fetch('/api/playbooks?workspaceId=1')
        if (response.ok) {
          const data = await response.json()
          setPlaybooks(data)
        }
      } catch (error) {
        console.error('Failed to load playbooks:', error)
      }
    }

    fetchPlaybooks()
  }, [])

  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Playbooks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {playbooks.length} {playbooks.length === 1 ? 'playbook' : 'playbooks'}
          </p>
        </div>

        {canEdit && (
          <Link
            href="/app/playbooks/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover-lift"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white'
            }}
          >
            <Plus className="w-5 h-5" />
            New Playbook
          </Link>
        )}
      </div>

      {playbooks.length === 0 ? (
        <div className="text-center py-16 border rounded-xl" style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}>
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No playbooks yet</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {canEdit
              ? 'Create your first playbook to get started'
              : 'No playbooks have been created yet'}
          </p>
          {canEdit && (
            <Link
              href="/app/playbooks/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover-lift"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white'
              }}
            >
              <Plus className="w-5 h-5" />
              Create Playbook
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {playbooks.map((playbook) => (
            <Link
              key={playbook.id}
              href={`/app/playbooks/${playbook.id}`}
              className="playbook-card block p-6 rounded-xl transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{playbook.title}</h3>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-4 h-4" />
                  {new Date(playbook.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {playbook.description && (
                <p className="mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{playbook.description}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {playbook.tags && playbook.tags.length > 0 && playbook.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-accent)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  by {playbook.author.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
