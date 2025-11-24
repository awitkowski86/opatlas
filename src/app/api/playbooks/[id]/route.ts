import { NextRequest, NextResponse } from 'next/server'

// Shared in-memory storage - in production this would be a real database
// We need to export/import this to share between route files
declare global {
  var playbooksStore: any[]
}

global.playbooksStore = global.playbooksStore || []

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  
  const playbook = global.playbooksStore.find(p => p.id === id)
  
  if (!playbook) {
    return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
  }

  return NextResponse.json(playbook)
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, contentMd, tags } = body

    const index = global.playbooksStore.findIndex(p => p.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
    }

    // Update playbook
    global.playbooksStore[index] = {
      ...global.playbooksStore[index],
      title: title ?? global.playbooksStore[index].title,
      description: description ?? global.playbooksStore[index].description,
      contentMd: contentMd ?? global.playbooksStore[index].contentMd,
      tags: tags ?? global.playbooksStore[index].tags,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(global.playbooksStore[index])
  } catch (error) {
    console.error('Playbook update error:', error)
    return NextResponse.json(
      { error: 'Failed to update playbook' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  
  const index = global.playbooksStore.findIndex(p => p.id === id)
  
  if (index === -1) {
    return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
  }

  global.playbooksStore.splice(index, 1)

  return NextResponse.json({ success: true })
}
