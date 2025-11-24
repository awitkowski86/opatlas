'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, CheckCircle2, Circle, Clock, User, Save, Flag, UserPlus, MessageSquare, Send } from 'lucide-react'
import MentionInput from '@/components/MentionInput'
import { sendNotification } from '@/components/NotificationCenter'
import PresenceIndicator from '@/components/PresenceIndicator'
import { LoadingPage } from '@/components/LoadingSpinner'

type PlaybookRun = {
  id: string
  workspaceId: string
  playbookId: string
  playbookTitle: string
  status: 'in-progress' | 'completed' | 'abandoned'
  startedAt: string
  completedAt: string | null
  startedBy: {
    id: string
    name: string
  }
  assignedTo?: {
    id: string
    name: string
  } | null
  checkedSteps: string[]
  stepNotes?: { [stepId: string]: string }
  notes: string
  comments?: Array<{
    id: string
    stepId: string
    userId: string
    userName: string
    text: string
    createdAt: string
  }>
  progress: number
  duration?: number | null
}

type Playbook = {
  id: string
  title: string
  description: string
  contentMd: string
  tags: string[]
}

interface ChecklistItem {
  id: string
  text: string
  type: 'checkbox' | 'heading' | 'text'
  level?: number
  checked: boolean
}

export default function PlaybookRunPage() {
  const params = useParams()
  const router = useRouter()
  const [run, setRun] = useState<PlaybookRun | null>(null)
  const [playbook, setPlaybook] = useState<Playbook | null>(null)
  const [loading, setLoading] = useState(true)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedStepForComment, setSelectedStepForComment] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [commentMentions, setCommentMentions] = useState<string[]>([])
  const [notesMentions, setNotesMentions] = useState<string[]>([])
  const [selectedStepForNote, setSelectedStepForNote] = useState<string | null>(null)
  const [stepNoteText, setStepNoteText] = useState('')
  const notesRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch run data
        const runResponse = await fetch(`/api/runs/${params.id}`)
        if (!runResponse.ok) throw new Error('Run not found')
        const runData = await runResponse.json()
        setRun(runData)
        setNotes(runData.notes || '')

        // Fetch playbook data
        const playbookResponse = await fetch(`/api/playbooks/${runData.playbookId}`)
        if (playbookResponse.ok) {
          const playbookData = await playbookResponse.json()
          setPlaybook(playbookData)
          
          // Parse markdown into checklist items
          parseMarkdownToChecklist(playbookData.contentMd, runData.checkedSteps)
        }
      } catch (error) {
        console.error('Failed to load run:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const parseMarkdownToChecklist = (markdown: string, checkedSteps: string[]) => {
    const lines = markdown.split('\n')
    const items: ChecklistItem[] = []
    let itemId = 0

    lines.forEach((line, index) => {
      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        items.push({
          id: `h-${itemId++}`,
          text: headingMatch[2].trim(),
          type: 'heading',
          level: headingMatch[1].length,
          checked: false
        })
        return
      }

      // Checkbox items
      const checkboxMatch = line.match(/^[\s-]*\[\s*\]\s+(.+)$/)
      if (checkboxMatch) {
        const id = `step-${itemId++}`
        items.push({
          id,
          text: checkboxMatch[1].trim(),
          type: 'checkbox',
          checked: checkedSteps.includes(id)
        })
        return
      }

      // Regular numbered or bulleted list items
      const listMatch = line.match(/^[\s-]*(?:\d+\.|\*|-)\s+(?:\*\*)?(.+?)(?:\*\*)?(?:\s*\(|$)/)
      if (listMatch) {
        const id = `step-${itemId++}`
        items.push({
          id,
          text: listMatch[1].trim(),
          type: 'checkbox',
          checked: checkedSteps.includes(id)
        })
      }
    })

    setChecklist(items)
  }

  const toggleStep = async (stepId: string) => {
    if (!run) return

    const newChecklist = checklist.map(item =>
      item.id === stepId ? { ...item, checked: !item.checked } : item
    )
    setChecklist(newChecklist)

    const checkedSteps = newChecklist.filter(item => item.checked && item.type === 'checkbox').map(item => item.id)
    const totalSteps = newChecklist.filter(item => item.type === 'checkbox').length
    const progress = totalSteps > 0 ? Math.round((checkedSteps.length / totalSteps) * 100) : 0

    // Update run
    try {
      await fetch(`/api/runs/${run.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedSteps, progress })
      })
      
      setRun({ ...run, checkedSteps, progress })
    } catch (error) {
      console.error('Failed to update step:', error)
    }
  }

  const saveNotes = async () => {
    if (!run) return

    setSaving(true)
    try {
      await fetch(`/api/runs/${run.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      // Send notifications for mentions in notes
      if (notesMentions.length > 0) {
        notesMentions.forEach(userId => {
          sendNotification({
            type: 'mention',
            title: 'You were mentioned',
            message: `Demo User mentioned you in notes for "${playbook?.title}"`,
            link: `/app/runs/${run.id}`
          })
        })
      }
      
      setRun({ ...run, notes })
    } catch (error) {
      console.error('Failed to save notes:', error)
      alert('Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  const completeRun = async () => {
    if (!run) return
    if (!confirm('Mark this run as completed?')) return

    try {
      await fetch(`/api/runs/${run.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', progress: 100 })
      })
      
      router.push('/app/runs')
    } catch (error) {
      console.error('Failed to complete run:', error)
      alert('Failed to complete run')
    }
  }

  const assignRun = async (userName: string) => {
    if (!run) return

    try {
      await fetch(`/api/runs/${run.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedTo: { id: '2', name: userName }
        })
      })
      
      setRun({ ...run, assignedTo: { id: '2', name: userName } })
      setShowAssignModal(false)

      // Send notification to assigned user
      sendNotification({
        type: 'assignment',
        title: 'Run assigned to you',
        message: `Demo User assigned you to run "${playbook?.title}"`,
        link: `/app/runs/${run.id}`
      })
    } catch (error) {
      console.error('Failed to assign run:', error)
      alert('Failed to assign run')
    }
  }

  const addComment = async (stepId: string) => {
    if (!run || !commentText.trim()) return

    try {
      await fetch(`/api/runs/${run.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          comment: {
            stepId,
            userId: '1',
            userName: 'Demo User',
            text: commentText.trim()
          }
        })
      })
      
      const updatedComments = [
        ...(run.comments || []),
        {
          id: `comment-${Date.now()}`,
          stepId,
          userId: '1',
          userName: 'Demo User',
          text: commentText.trim(),
          createdAt: new Date().toISOString()
        }
      ]
      
      setRun({ ...run, comments: updatedComments })
      
      // Send notifications for mentions
      if (commentMentions.length > 0) {
        const stepText = checklist.find(item => item.id === stepId)?.text || 'a step'
        commentMentions.forEach(userId => {
          sendNotification({
            type: 'mention',
            title: 'You were mentioned',
            message: `Demo User mentioned you in a comment on "${playbook?.title}": ${stepText}`,
            link: `/app/runs/${run.id}`
          })
        })
      }
      
      setCommentText('')
      setCommentMentions([])
      setSelectedStepForComment(null)
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment')
    }
  }

  const saveStepNote = async (stepId: string) => {
    if (!run || !stepNoteText.trim()) return

    try {
      const updatedStepNotes = {
        ...run.stepNotes,
        [stepId]: stepNoteText.trim()
      }

      await fetch(`/api/runs/${run.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stepNotes: { [stepId]: stepNoteText.trim() }
        })
      })
      
      setRun({ ...run, stepNotes: updatedStepNotes })
      setStepNoteText('')
      setSelectedStepForNote(null)
    } catch (error) {
      console.error('Failed to save step note:', error)
      alert('Failed to save step note')
    }
  }

  const formatDuration = (ms: number | null | undefined) => {
    if (!ms) return 'N/A'
    
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (loading) {
    return <LoadingPage message="Loading run..." />
  }

  if (!run || !playbook) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="p-6 rounded-lg border" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'var(--error)',
          color: 'var(--error)'
        }}>
          Run not found
        </div>
      </div>
    )
  }

  const totalSteps = checklist.filter(item => item.type === 'checkbox').length
  const completedSteps = checklist.filter(item => item.checked && item.type === 'checkbox').length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/app/runs')}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm transition-all"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-secondary)'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            All Runs
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={completeRun}
              disabled={run.status === 'completed'}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: run.status === 'completed' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.9)',
                color: 'white',
                border: '1px solid rgba(5, 150, 105, 0.8)',
                cursor: run.status === 'completed' ? 'not-allowed' : 'pointer'
              }}
            >
              <Flag className="w-4 h-4" />
              {run.status === 'completed' ? 'Completed' : 'Complete Run'}
            </button>
          </div>
        </div>

        {/* Run Info */}
        <div className="border rounded-lg p-6" style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-secondary)'
        }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {playbook.title}
              </h1>
              <div className="flex items-center gap-4 text-sm flex-wrap" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {run.startedBy.name}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Started {new Date(run.startedAt).toLocaleString()}
                </div>
                {run.status === 'completed' && run.duration && (
                  <div className="flex items-center gap-2 px-2 py-1 rounded" style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: 'rgba(16, 185, 129, 1)'
                  }}>
                    <Clock className="w-4 h-4" />
                    Duration: {formatDuration(run.duration)}
                  </div>
                )}
                {run.assignedTo && (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Assigned to {run.assignedTo.name}
                  </div>
                )}
                <PresenceIndicator location={`run:${run.id}`} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-secondary)'
                }}
              >
                <UserPlus className="w-4 h-4" />
                {run.assignedTo ? 'Reassign' : 'Assign'}
              </button>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1" style={{ 
                  color: run.progress === 100 ? 'rgba(16, 185, 129, 1)' : 'var(--text-accent)' 
                }}>
                  {run.progress}%
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {completedSteps} of {totalSteps} steps
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
                backgroundColor: run.progress === 100 ? 'rgba(16, 185, 129, 1)' : 'rgba(0, 120, 212, 0.9)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-6" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)'
          }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Steps
            </h2>

            <div className="space-y-2">
              {checklist.map((item) => {
                if (item.type === 'heading') {
                  return (
                    <div 
                      key={item.id}
                      className={`font-semibold mt-4 mb-2`}
                      style={{ 
                        color: 'var(--text-primary)',
                        fontSize: item.level === 1 ? '1.25rem' : item.level === 2 ? '1.1rem' : '1rem',
                        marginLeft: `${(item.level! - 1) * 12}px`
                      }}
                    >
                      {item.text}
                    </div>
                  )
                }

                if (item.type === 'checkbox') {
                  const stepComments = (run.comments || []).filter(c => c.stepId === item.id)
                  
                  return (
                    <div key={item.id} className="space-y-2">
                      <button
                        onClick={() => toggleStep(item.id)}
                        className="w-full flex items-start gap-3 p-3 rounded transition-all text-left"
                        style={{
                          backgroundColor: item.checked ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
                          borderLeft: item.checked ? '3px solid rgba(16, 185, 129, 1)' : '3px solid transparent'
                        }}
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(16, 185, 129, 1)' }} />
                        ) : (
                          <Circle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }} />
                        )}
                        <div className="flex-1">
                          <span style={{ 
                            color: item.checked ? 'var(--text-secondary)' : 'var(--text-primary)',
                            textDecoration: item.checked ? 'line-through' : 'none'
                          }}>
                            {item.text}
                          </span>
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStepForComment(item.id)
                              }}
                              className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
                              style={{ color: 'var(--text-accent)' }}
                              title="Add comment"
                            >
                              <MessageSquare className="w-4 h-4" /> 
                              {stepComments.length > 0 && stepComments.length}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStepForNote(item.id)
                                setStepNoteText(run.stepNotes?.[item.id] || '')
                              }}
                              className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
                              style={{ color: run.stepNotes?.[item.id] ? 'rgba(251, 146, 60, 1)' : 'var(--text-secondary)' }}
                              title="Add historical note"
                            >
                              📝 {run.stepNotes?.[item.id] && '✓'}
                            </button>
                          </div>
                        </div>
                      </button>

                      {/* Step Historical Note */}
                      {run.stepNotes?.[item.id] && selectedStepForNote !== item.id && (
                        <div className="ml-8 p-3 rounded text-sm" style={{
                          backgroundColor: 'rgba(251, 146, 60, 0.1)',
                          borderLeft: '3px solid rgba(251, 146, 60, 1)'
                        }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium" style={{ color: 'rgba(251, 146, 60, 1)' }}>
                              📝 Historical Note
                            </span>
                          </div>
                          <p style={{ color: 'var(--text-primary)' }}>{run.stepNotes[item.id]}</p>
                        </div>
                      )}

                      {/* Step Comments */}
                      {stepComments.length > 0 && (
                        <div className="ml-8 space-y-2">
                          {stepComments.map((comment) => (
                            <div 
                              key={comment.id}
                              className="p-3 rounded text-sm"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderLeft: '2px solid var(--border-secondary)'
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>
                                  {comment.userName}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p style={{ color: 'var(--text-secondary)' }}>{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      {selectedStepForComment === item.id && (
                        <div className="ml-8">
                          <div className="flex gap-2 items-start">
                            <MentionInput
                              value={commentText}
                              onChange={(value, mentions) => {
                                setCommentText(value)
                                setCommentMentions(mentions)
                              }}
                              placeholder="Add a comment... (Type @ to mention)"
                              className="flex-1 px-3 py-2 rounded border text-sm resize-none"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderColor: 'var(--border-secondary)',
                                color: 'var(--text-primary)'
                              }}
                              autoFocus
                              onSubmit={() => addComment(item.id)}
                              onCancel={() => {
                                setSelectedStepForComment(null)
                                setCommentText('')
                                setCommentMentions([])
                              }}
                            />
                            <button
                              onClick={() => addComment(item.id)}
                              disabled={!commentText.trim()}
                              className="px-3 py-2 rounded text-sm transition-all"
                              style={{
                                backgroundColor: commentText.trim() ? 'var(--text-accent)' : 'var(--bg-tertiary)',
                                color: commentText.trim() ? 'white' : 'var(--text-secondary)',
                                cursor: commentText.trim() ? 'pointer' : 'not-allowed'
                              }}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStepForComment(null)
                                setCommentText('')
                              }}
                              className="px-3 py-2 rounded text-sm transition-all"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step Note Input */}
                      {selectedStepForNote === item.id && (
                        <div className="ml-8">
                          <div className="flex gap-2 items-start">
                            <textarea
                              value={stepNoteText}
                              onChange={(e) => setStepNoteText(e.target.value)}
                              placeholder="Add a historical note about this step..."
                              className="flex-1 px-3 py-2 rounded border text-sm resize-none"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderColor: 'var(--border-secondary)',
                                color: 'var(--text-primary)'
                              }}
                              autoFocus
                              rows={3}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.metaKey) {
                                  e.preventDefault()
                                  saveStepNote(item.id)
                                }
                                if (e.key === 'Escape') {
                                  setSelectedStepForNote(null)
                                  setStepNoteText('')
                                }
                              }}
                            />
                            <button
                              onClick={() => saveStepNote(item.id)}
                              disabled={!stepNoteText.trim()}
                              className="px-3 py-2 rounded text-sm transition-all"
                              style={{
                                backgroundColor: stepNoteText.trim() ? 'rgba(251, 146, 60, 1)' : 'var(--bg-tertiary)',
                                color: stepNoteText.trim() ? 'white' : 'var(--text-secondary)',
                                cursor: stepNoteText.trim() ? 'pointer' : 'not-allowed'
                              }}
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStepForNote(null)
                                setStepNoteText('')
                              }}
                              className="px-3 py-2 rounded text-sm transition-all"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                            Historical notes are saved with the run for future reference. Cmd+Enter to save.
                          </p>
                        </div>
                      )}
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)'
          }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Execution Notes
            </h2>

            <MentionInput
              value={notes}
              onChange={(value, mentions) => {
                setNotes(value)
                setNotesMentions(mentions)
              }}
              placeholder="Add notes about this run... (Type @ to mention)"
              className="w-full h-64 p-3 rounded border text-sm resize-none"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-secondary)',
                color: 'var(--text-primary)'
              }}
            />

            <button
              onClick={saveNotes}
              disabled={saving}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: saving ? 'rgba(0, 120, 212, 0.5)' : 'rgba(0, 120, 212, 0.9)',
                color: 'white',
                border: '1px solid rgba(16, 110, 190, 0.8)',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowAssignModal(false)}
        >
          <div 
            className="border rounded-lg p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-secondary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Assign Run
            </h3>
            
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Choose who should execute this playbook run:
            </p>

            <div className="space-y-2 mb-6">
              {['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown'].map((name) => (
                <button
                  key={name}
                  onClick={() => assignRun(name)}
                  className="w-full flex items-center gap-3 p-3 rounded transition-all text-left"
                  style={{
                    backgroundColor: run.assignedTo?.name === name ? 'rgba(0, 120, 212, 0.1)' : 'var(--bg-secondary)',
                    borderColor: 'var(--border-secondary)',
                    border: '1px solid var(--border-secondary)'
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      backgroundColor: 'var(--text-accent)',
                      color: 'white'
                    }}
                  >
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span style={{ color: 'var(--text-primary)' }}>{name}</span>
                  {run.assignedTo?.name === name && (
                    <CheckCircle2 className="w-5 h-5 ml-auto" style={{ color: 'var(--text-accent)' }} />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 rounded text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-secondary)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
