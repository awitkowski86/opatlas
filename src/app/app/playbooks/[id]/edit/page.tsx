'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PlaybookForm from '@/components/PlaybookForm'
import { LoadingPage } from '@/components/LoadingSpinner'

export default function EditPlaybookPage() {
  const params = useParams()
  const [playbook, setPlaybook] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaybook = async () => {
      try {
        const response = await fetch(`/api/playbooks/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setPlaybook(data)
        }
      } catch (error) {
        console.error('Failed to load playbook:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaybook()
  }, [params.id])

  if (loading) {
    return <LoadingPage message="Loading playbook..." />
  }

  if (!playbook) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-lg border" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'var(--error)',
          color: 'var(--error)'
        }}>
          Playbook not found
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Edit Playbook</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Update your playbook content</p>
      </div>

      <PlaybookForm
        workspaceId="1"
        playbookId={playbook.id}
        initialData={{
          title: playbook.title,
          description: playbook.description || '',
          contentMd: playbook.contentMd,
          tags: playbook.tags || [],
        }}
      />
    </div>
  )
}
