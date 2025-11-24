import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const run = global.playbookRunsStore?.find(r => r.id === id)

  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  }

  return NextResponse.json(run)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const runIndex = global.playbookRunsStore?.findIndex(r => r.id === id)

    if (runIndex === -1 || runIndex === undefined) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    const run = global.playbookRunsStore[runIndex]

    // Update fields
    if (body.status !== undefined) {
      run.status = body.status
      if (body.status === 'completed' && !run.completedAt) {
        run.completedAt = new Date().toISOString()
        // Calculate duration
        const startTime = new Date(run.startedAt).getTime()
        const endTime = new Date(run.completedAt).getTime()
        run.duration = endTime - startTime
      }
    }

    if (body.checkedSteps !== undefined) {
      run.checkedSteps = body.checkedSteps
    }

    if (body.stepNotes !== undefined) {
      // Update step notes - expects { stepId: 'note text' }
      if (!run.stepNotes) run.stepNotes = {}
      run.stepNotes = { ...run.stepNotes, ...body.stepNotes }
    }

    if (body.notes !== undefined) {
      run.notes = body.notes
    }

    if (body.progress !== undefined) {
      run.progress = body.progress
    }

    if (body.assignedTo !== undefined) {
      run.assignedTo = body.assignedTo
    }

    if (body.comment !== undefined) {
      // Add a new comment
      if (!run.comments) run.comments = []
      run.comments.push({
        id: `comment-${Date.now()}`,
        ...body.comment,
        createdAt: new Date().toISOString()
      })
    }

    global.playbookRunsStore[runIndex] = run

    console.log('Updated run:', run.id, 'status:', run.status, 'progress:', run.progress)
    return NextResponse.json(run)
  } catch (error) {
    console.error('Run update error:', error)
    return NextResponse.json(
      { error: 'Failed to update run' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const runIndex = global.playbookRunsStore?.findIndex(r => r.id === id)

  if (runIndex === -1 || runIndex === undefined) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  }

  global.playbookRunsStore.splice(runIndex, 1)
  console.log('Deleted run:', id)

  return NextResponse.json({ success: true })
}
