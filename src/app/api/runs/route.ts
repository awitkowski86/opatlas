import { NextRequest, NextResponse } from 'next/server'

// Shared global storage for demo mode
declare global {
  var playbookRunsStore: any[]
  var nextRunId: number
}

global.playbookRunsStore = global.playbookRunsStore || []
global.nextRunId = global.nextRunId || 1

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get('workspaceId')
  const status = searchParams.get('status') // 'active', 'completed', 'all'

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
  }

  let filtered = global.playbookRunsStore.filter(r => String(r.workspaceId) === String(workspaceId))
  
  if (status === 'active') {
    filtered = filtered.filter(r => r.status === 'in-progress')
  } else if (status === 'completed') {
    filtered = filtered.filter(r => r.status === 'completed')
  }

  // Sort by started date, most recent first
  filtered.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

  console.log('GET /api/runs - workspaceId:', workspaceId, 'status:', status, 'found:', filtered.length)
  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, playbookId, playbookTitle, userId, userName, assignedTo } = body

    if (!workspaceId || !playbookId || !playbookTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const run = {
      id: String(global.nextRunId++),
      workspaceId: String(workspaceId),
      playbookId: String(playbookId),
      playbookTitle,
      status: 'in-progress', // 'in-progress', 'completed', 'abandoned'
      startedAt: new Date().toISOString(),
      completedAt: null,
      startedBy: {
        id: userId || '1',
        name: userName || 'Demo User'
      },
      assignedTo: assignedTo || null, // { id, name } or null
      checkedSteps: [], // Array of step IDs that have been checked off
      stepNotes: {}, // Object mapping stepId -> note text for historical tracking
      notes: '', // User notes during execution
      comments: [], // Array of { stepId, userId, userName, text, createdAt }
      progress: 0, // Percentage complete
      duration: null // Duration in milliseconds, calculated when completed
    }

    global.playbookRunsStore.push(run)
    console.log('Created run:', run.id, 'for playbook:', playbookId, 'assigned to:', assignedTo?.name || 'unassigned', 'total runs:', global.playbookRunsStore.length)

    return NextResponse.json(run, { status: 201 })
  } catch (error) {
    console.error('Run creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create run' },
      { status: 500 }
    )
  }
}
