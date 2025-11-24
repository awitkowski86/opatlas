import { NextRequest, NextResponse } from 'next/server'

// Shared global storage for demo mode
declare global {
  var playbooksStore: any[]
  var nextPlaybookId: number
}

global.playbooksStore = global.playbooksStore || []
global.nextPlaybookId = global.nextPlaybookId || 1

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get('workspaceId')

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
  }

  // Return demo playbooks - compare as strings
  const filtered = global.playbooksStore.filter(p => String(p.workspaceId) === String(workspaceId))
  console.log('GET /api/playbooks - workspaceId:', workspaceId, 'found:', filtered.length, 'total:', global.playbooksStore.length)
  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, title, description, contentMd, tags, triggers, relatedPlaybooks } = body

    if (!workspaceId || !title || !contentMd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const playbook = {
      id: String(global.nextPlaybookId++),
      workspaceId: String(workspaceId), // Ensure it's a string
      title,
      description: description || '',
      contentMd,
      tags: tags || [],
      triggers: triggers || [], // When to use this playbook
      relatedPlaybooks: relatedPlaybooks || [], // IDs of related playbooks
      usageCount: 0, // Track how often it's used
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: '1',
        name: 'Demo User',
        email: 'demo@opatlas.com'
      }
    }

    global.playbooksStore.push(playbook)
    console.log('Created playbook:', playbook.id, 'workspaceId:', playbook.workspaceId, 'total playbooks:', global.playbooksStore.length)

    return NextResponse.json(playbook, { status: 201 })
  } catch (error) {
    console.error('Playbook creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create playbook' },
      { status: 500 }
    )
  }
}
