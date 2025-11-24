'use client'

import PlaybookForm from '@/components/PlaybookForm'

export default function NewPlaybookPage() {
  const workspaceId = '1' // Demo workspace ID

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Create Playbook</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Document your processes and best practices</p>
      </div>

      <PlaybookForm workspaceId={workspaceId} />
    </div>
  )
}
