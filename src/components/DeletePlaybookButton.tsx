'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeletePlaybookButton({ playbookId }: { playbookId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/playbooks/${playbookId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete playbook')
      }

      router.push('/app/playbooks')
      router.refresh()
    } catch (error) {
      alert('Failed to delete playbook')
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/30 text-red-400 font-medium transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Delete this playbook?</span>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-medium transition-colors"
      >
        {isDeleting ? 'Deleting...' : 'Confirm'}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        disabled={isDeleting}
        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
